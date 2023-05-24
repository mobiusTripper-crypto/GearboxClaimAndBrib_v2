import { deployments, ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  if (hre.network.name !== "hardhat") {
    console.log(
      `Deploying GearboxClaimAndBrib to ${hre.network.name}. Hit ctrl + c to abort`
    );
  }

  const { deploy } = deployments;
  const [, owner, keeper, randomUser] = await ethers.getSigners();

  const deployer = await ethers.getSigner(
    "0x94f2bfbc27655Dd5489B42E2e5D84805E143ca95"
  );

  const gearboxClaimAndBrib = await deploy("GearboxClaimAndBrib", {
    from: deployer.address,
    log: hre.network.name !== "hardhat",
    nonce: 0,
    args: [
      keeper.address,
      "0x642c59937A62cf7dc92F70Fd78A13cEe0aa2Bd9c",
      "0x7Cdf753b45AB0729bcFe33DC12401E55d28308A9",
      randomUser.address,
      50,
      100, // 2 weeks in seconds
    ],
  });

  //  set in gearbox tree address
  const contract = await hre.ethers.getContractAt(
    "GearboxClaimAndBrib",
    gearboxClaimAndBrib.address
  );
  await contract.setGearboxTree("0xA7Df60785e556d65292A2c9A077bb3A8fBF048BC");
};

export default func;

func.tags = ["GearboxClaimAndBrib"];
