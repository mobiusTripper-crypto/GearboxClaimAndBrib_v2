import { Contract, ethers } from "ethers";
import ky from "ky";
import ClaimAndBribeABI from "../../artifacts/contracts/GearboxClaimAndBrib.sol/GearboxClaimAndBrib.json";
import { GEARBOX_MERKLE_BASE_URL } from "./constants";

const GearAirdropDistributorABI = [
  "function merkleRoot() external view returns(bytes32)",
];

export default async function getGearboxData(
  multisigClaimAddress: string,
  claimAndBribeContractAddress: string,
  provider: ethers.providers.StaticJsonRpcProvider
): Promise<{
  gearboxIndex: number;
  gearboxMerkleProof: string;
  rewardAmount: string;
}> {
  try {
    const claimAndBribeContract = new Contract(
      claimAndBribeContractAddress,
      ClaimAndBribeABI.abi,
      provider
    );

    const gearboxTreeAddress = "0xA7Df60785e556d65292A2c9A077bb3A8fBF048BC";
    //(await claimAndBribeContract.gearboxTree()) as string;

    console.log("gearboxTreeAddress", gearboxTreeAddress);

    const contract = new Contract(
      gearboxTreeAddress,
      GearAirdropDistributorABI,
      provider
    );

    console.log("gearbox", contract.address);

    const merkleRoot = (await contract.merkleRoot()) as string;

    console.log("merkleRoot", merkleRoot);

    const gearboxMerkleProofURL = `${GEARBOX_MERKLE_BASE_URL}mainnet_${
      ethers.utils.isHexString(merkleRoot) ? merkleRoot.slice(2) : merkleRoot
    }.json`;

    const gearboxResponse: any = await ky
      .get(gearboxMerkleProofURL, { timeout: 5_000, retry: 0 })
      .json();
    const gearboxData = gearboxResponse["claims"][multisigClaimAddress];

    const gearboxIndex = gearboxData.index as number;
    const gearboxMerkleProof = gearboxData.proof as string;
    const rewardAmount = gearboxData.amount as string;

    return { gearboxIndex, gearboxMerkleProof, rewardAmount };
  } catch (error) {
    throw `error in getGearboxMerkleProof: ${error.message} `;
  }
}
