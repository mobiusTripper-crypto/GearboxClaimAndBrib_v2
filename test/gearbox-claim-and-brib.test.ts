import hre, { ethers } from "hardhat";
import { expect } from "chai";
import { before } from "mocha";
import { Web3FunctionHardhat } from "@gelatonetwork/web3-functions-sdk/hardhat-plugin";
const { deployments, w3f } = hre;

describe("web3 GearboxClaimAndBrib Tests", function () {
  this.timeout(0);

  let gearboxClaimAndBrib: Web3FunctionHardhat;

  before(async function () {
    //    await deployments.fixture();

    const contract = await ethers.getContractAt(
      "GearboxClaimAndBrib",
      "0xa1Cd2838D7D402176BC9D260b957ace715fE2Af1"
    );

    const address1 = "0x94f2bfbc27655Dd5489B42E2e5D84805E143ca95";
    const deployer1 = await ethers.getImpersonatedSigner(address1);
    await contract
      .connect(deployer1)
      .setGearboxTree("0xA7Df60785e556d65292A2c9A077bb3A8fBF048BC");
    console.log("gearbox tree", await contract.gearboxTree());

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
