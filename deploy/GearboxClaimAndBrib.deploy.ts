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

  const xxx = await deploy("GearboxClaimAndBrib", {
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

  console.log("deployed address", xxx.address);
};

export default func;

func.tags = ["GearboxClaimAndBrib"];
