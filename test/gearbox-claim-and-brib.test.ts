import hre, { ethers } from "hardhat";
import { expect } from "chai";
import { before } from "mocha";
import { Web3FunctionHardhat } from "@gelatonetwork/web3-functions-sdk/hardhat-plugin";
const { deployments, w3f } = hre;

describe("web3 GearboxClaimAndBrib Tests", function () {
  this.timeout(0);

  let gearboxClaimAndBrib: Web3FunctionHardhat;

  before(async function () {
    await deployments.fixture();

    const contract = await hre.ethers.getContract("GearboxClaimAndBrib");
    await contract.setGearboxTree("0xA7Df60785e556d65292A2c9A077bb3A8fBF048BC");

    console.log(
      "web3 test",
      contract.address,
      (await ethers.provider.getNetwork()).chainId,
      ethers.provider.blockNumber
    );
    gearboxClaimAndBrib = w3f.get("gearbox-claim-and-brib");
  });

  it("Return canExec: true", async () => {
    const { result } = await gearboxClaimAndBrib.run();

    expect(result.canExec).to.equal(true);
  });
});
