import { deployments, getNamedAccounts } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  if (hre.network.name !== "hardhat") {
    console.log(
      `Deploying GearboxClaimAndBrib to ${hre.network.name}. Hit ctrl + c to abort`
    );
  }

  const { deploy } = deployments;
  const { deployer, keeper, placeholderAddress } = await getNamedAccounts();

  const gearboxClaimAndBrib = await deploy("GearboxClaimAndBrib", {
    from: deployer,
    log: hre.network.name !== "hardhat",
    nonce: 0,
    args: [
      keeper,
      placeholderAddress,
      placeholderAddress,
      placeholderAddress,
      0,
      14 * 24 * 60 * 60, // 2 weeks in seconds
    ],
  });

  // set in gearbox tree address
  //   const contract = await hre.ethers.getContractAt(
  //     "GearboxClaimAndBrib",
  //     gearboxClaimAndBrib.address
  //   );
  //   await contract.setGearboxTree("0xA7Df60785e556d65292A2c9A077bb3A8fBF048BC");
};

export default func;

func.tags = ["GearboxClaimAndBrib"];
