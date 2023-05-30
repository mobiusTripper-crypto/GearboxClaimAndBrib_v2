import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  if (hre.network.name !== "hardhat") {
    console.log(
      `Deploying GearboxClaimAndBrib to ${hre.network.name}. Hit ctrl + c to abort`
    );
  }

  const deployerAddress = "0x94f2bfbc27655Dd5489B42E2e5D84805E143ca95";
  const whaleAddress = "0x1b3cb81e51011b549d78bf720b0d924ac763a7c2";

  const deployer = await ethers.getImpersonatedSigner(deployerAddress);
  const whale = await ethers.getImpersonatedSigner(whaleAddress);

  console.log("before balance", await deployer.getBalance());
  await whale.sendTransaction({
    to: deployerAddress,
    value: ethers.utils.parseEther("10000.0"),
  });
  console.log("after balance", await deployer.getBalance());

  const [, , keeper, randomUser] = await ethers.getSigners();

  console.log("deploy BlockNumber", ethers.provider.blockNumber);

  const contractFactory = await ethers.getContractFactory(
    "GearboxClaimAndBrib"
  );
  const gearboxClaimAndBrib = await contractFactory
    .connect(deployer)
    .deploy(
      keeper.address,
      "0x642c59937A62cf7dc92F70Fd78A13cEe0aa2Bd9c",
      "0x7Cdf753b45AB0729bcFe33DC12401E55d28308A9",
      randomUser.address,
      50,
      100
    );

  console.log("deploy contract address", gearboxClaimAndBrib.address);

  await gearboxClaimAndBrib
    .connect(deployer)
    .setGearboxTree("0xA7Df60785e556d65292A2c9A077bb3A8fBF048BC");
};

export default func;

func.tags = ["GearboxClaimAndBrib"];
