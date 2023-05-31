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
    const gearboxTreeAddress =
      (await claimAndBribeContract.gearboxTree()) as string;

    const contract = new Contract(
      gearboxTreeAddress,
      GearAirdropDistributorABI,
      provider
    );
    const merkleRoot = (await contract.merkleRoot()) as string;

    const gearboxMerkleProofURL = `${GEARBOX_MERKLE_BASE_URL}mainnet_${
      ethers.utils.isHexString(merkleRoot) ? merkleRoot.slice(2) : merkleRoot
    }.json`;

    console.log(gearboxMerkleProofURL);

    const gearboxResponse: any = await ky
      .get(gearboxMerkleProofURL, { timeout: 5_000, retry: 0 })
      .json();

    console.log("got response");
    const gearboxData = gearboxResponse["claims"][multisigClaimAddress];
    console.log(gearboxData);

    const gearboxIndex = gearboxData.index as number;
    console.log("1");
    const gearboxMerkleProof = gearboxData.proof as string;
    console.log("2");
    const rewardAmount = gearboxData.amount as string;
    console.log("3");

    return { gearboxIndex, gearboxMerkleProof, rewardAmount };
  } catch (error) {
    throw `error in getGearboxMerkleProof: ${error.message} `;
  }
}
