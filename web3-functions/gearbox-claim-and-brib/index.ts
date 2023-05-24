import {
  Web3Function,
  Web3FunctionContext,
} from "@gelatonetwork/web3-functions-sdk";
import { Contract, ethers, BigNumber } from "ethers";

import verifyUserArgs from "./verifyUserArgs";
import getGearboxData from "./getGearboxData";
import getAuraProposalHash from "./getAuraProposalHash";

import ClaimAndBribeABI from "../../artifacts/contracts/GearboxClaimAndBrib.sol/GearboxClaimAndBrib.json";
import getBalancerProposalHash from "./getBalancerProposalHash";

Web3Function.onRun(async (context: Web3FunctionContext) => {
  const { userArgs, multiChainProvider } = context;

  const provider = multiChainProvider.default();

  try {
    console.log("web3 gearbox-claim-and-bribe function start");
    const {
      multisigClaimAddress,
      tokenAddress,
      gaugeToBribeAddress,
      claimAndBribeContractAddress,
      minimumReward,
    } = verifyUserArgs(userArgs);

    const claimAndBribe = new Contract(
      claimAndBribeContractAddress,
      ClaimAndBribeABI.abi,
      provider
    );
    console.log(
      "web3 function",
      claimAndBribe.address,
      (await provider.getNetwork()).chainId,
      provider.blockNumber
    );
    console.log("contract address from config", claimAndBribe.address);

    console.log(await claimAndBribe.gearboxTree());
    console.log("SUCCESS");

    const lastUpdated = parseInt(await claimAndBribe.lastRun());
    const minWaitPeriodSeconds = parseInt(
      await claimAndBribe.minWaitPeriodSeconds()
    );

    const nextUpdateTime = lastUpdated + minWaitPeriodSeconds;
    const timestamp = (await provider.getBlock("latest")).timestamp;
    console.log(
      "times",
      timestamp,
      lastUpdated,
      nextUpdateTime,
      timestamp < nextUpdateTime
    );

    if (timestamp < nextUpdateTime) {
      console.log("time error");
      return {
        canExec: false,
        message: "Not time to update, still within waiting period.",
      };
    }

    const { gearboxMerkleProof, rewardAmount, gearboxIndex } =
      await getGearboxData(
        multisigClaimAddress,
        claimAndBribeContractAddress,
        provider
      );

    if (BigNumber.from(rewardAmount).lt(minimumReward)) {
      const message: unknown = `Reward amount ${ethers.utils.formatEther(
        rewardAmount
      )} is less than minimum amount.`;
      return {
        canExec: false,
        message: message,
      };
    }

    const balancerProposalHash = await getBalancerProposalHash(
      gaugeToBribeAddress
    );
    const auraProposalHash = await getAuraProposalHash(gaugeToBribeAddress);

    console.log(`claimAndBrib function
    index=${gearboxIndex}
    totalAmount=${rewardAmount}
    merkleProof=${gearboxMerkleProof}
    auraProp=${auraProposalHash}
    balProp=${balancerProposalHash}
    tokenAddress=${tokenAddress}`);

    return {
      canExec: true,
      callData: [
        {
          to: claimAndBribe.address,
          data: claimAndBribe.interface.encodeFunctionData("claimAndBribeAll", [
            gearboxIndex,
            rewardAmount,
            gearboxMerkleProof,
            auraProposalHash,
            balancerProposalHash,
            tokenAddress,
          ]),
        },
      ],
    };
  } catch (err) {
    return { canExec: false, message: err };
  }
});
