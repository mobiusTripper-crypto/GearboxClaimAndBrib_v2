import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const TEST_AMOUNT = ethers.utils.parseEther("15");

describe("Test ClaimAndBrib Contract", function () {
  let deployer: SignerWithAddress,
    owner: SignerWithAddress,
    keeper: SignerWithAddress,
    randomUser: SignerWithAddress;
  let mockERC20: Contract;
  let gearboxClaimAndBrib: Contract;

  before("setup", async () => {
    [deployer, owner, keeper, randomUser] = await ethers.getSigners();

    const mockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockERC20 = await mockERC20Factory.deploy(
      "MockERC20",
      "ME2",
      owner.address,
      ethers.utils.parseEther("10000") // inital mock token balance
    );

    const address1 = "0x94f2bfbc27655Dd5489B42E2e5D84805E143ca95";

    //  const deployer = await getImpersonatedSigner(address);
    const deployer1 = await ethers.getImpersonatedSigner(address1);

    //    await deployments.fixture();

    gearboxClaimAndBrib = await ethers.getContractAt(
      "GearboxClaimAndBrib",
      "0xa1Cd2838D7D402176BC9D260b957ace715fE2Af1"
    );

    console.log("test contract address", gearboxClaimAndBrib.address);

    console.log("block 3", ethers.provider.blockNumber);
    // await gearboxClaimAndBrib.transferOwnership(owner.address);
    // await gearboxClaimAndBrib.connect(owner).acceptOwnership();

    await gearboxClaimAndBrib
      .connect(deployer1)
      .setGearboxTree("0xA7Df60785e556d65292A2c9A077bb3A8fBF048BC");
  });

  //   context("constructor", () => {
  //     it(`constructor sets correct parameters`, async () => {
  //       expect(await gearboxClaimAndBrib.keeperAddress()).to.be.eq(
  //         keeper.address,
  //         "keeperAddress constructor parameter not set correctly"
  //       );
  //       expect(await gearboxClaimAndBrib.auraHHBriber()).to.be.eq(
  //         "0x642c59937A62cf7dc92F70Fd78A13cEe0aa2Bd9c",
  //         "auraHHBriber constructor parameter not set correctly"
  //       );
  //       expect(await gearboxClaimAndBrib.balHHBriber()).to.be.eq(
  //         "0x7Cdf753b45AB0729bcFe33DC12401E55d28308A9",
  //         "balHHBriber constructor parameter not set correctly"
  //       );
  //       expect(await gearboxClaimAndBrib.HHVault()).to.be.eq(
  //         keeper.address,
  //         "HHVault constructor parameter not set correctly"
  //       );
  //       expect(await gearboxClaimAndBrib.pct_bal_bps()).to.be.eq(
  //         50,
  //         "pct_bal_bps constructor parameter not set correctly"
  //       );
  //       expect(await gearboxClaimAndBrib.minWaitPeriodSeconds()).to.be.eq(
  //         100,
  //         "minWaitPeriodSeconds constructor parameter not set correctly"
  //       );
  //     });
  //   });

  //   context("sweep", () => {
  //     it("correct amount of tokens swept to account, and zero balance in contract", async function () {
  //       //   const { mockERC20, owner, randomUser, gearboxClaimAndBrib } =
  //       //     await loadFixture(depolyContracts);

  //       await mockERC20.mint(gearboxClaimAndBrib.address, TEST_AMOUNT);

  //       await gearboxClaimAndBrib
  //         .connect(owner)
  //         .sweep(mockERC20.address, randomUser.address);

  //       expect(
  //         await mockERC20.balanceOf(randomUser.address),
  //         "swept balance incorrect"
  //       ).to.equal(TEST_AMOUNT);

  //       expect(
  //         await mockERC20.balanceOf(gearboxClaimAndBrib.address),
  //         "contract balance to be zero"
  //       ).to.equal(0);
  //     });

  //     it("revert if not owner", async function () {
  //       //   const { mockERC20, randomUser, gearboxClaimAndBrib } = await loadFixture(
  //       //     depolyContracts
  //       //   );

  //       await expect(
  //         gearboxClaimAndBrib
  //           .connect(randomUser)
  //           .sweep(mockERC20.address, randomUser.address)
  //       ).to.be.revertedWith("Only callable by owner");
  //     });
  //   });

  context("claim", function () {
    it("should claim tokens from gearbox", async function () {
      const merkleString = [
        "0x2ab11d2e64e41f663726c63984310ad5fb1c9f785823964a01a23aa119bf0813",
        "0xb48cd5b56944e54d567fefc11f14818789aca5e8a06024e109673f0c3b98d6b1",
        "0x8b544f9f3dbca6e8a45ead7f2788d5936aea5af24424485547cfb939f3d6d97b",
        "0x12df3695027f5b876cdef8b292674dd115186064554ba94111ff955d4c8c4b30",
        "0x31cb6c52beb644a04f1db9241e0819c5ce5b6bbf54b1ea257ababab2ba8ae9a0",
        "0x4d31b3260d6210c29454d019cb5165ac9430a8efb3cead0317908ee2746918c1",
        "0xd20fc47850ad20bd1d70fdfb65b2ff955af765c1fc0915a3b07f7f82d6f3159d",
        "0x2d50a584c143b4c45a2b8d275dbe8d067e044b103eed61da36dda68915f40ede",
        "0xbb883a46a88a85752c85aa20d50f938cbc11fe05baca9d91f481986afe0b3989",
        "0x801ac51f6a3361e70323f0212d768741f9f038dd36f296a4f7d8589d37a7552a",
        "0xbc7732404a5c8b3aed611fd03e988e05fc5c48cf83473b016527fead0c644dad",
        "0x5d8fd6beff3a724dd33742b5642e86ba9fa142aeaa553ec9c135b4bfce20a51d",
        "0x33519c1af7c0a07c3730f0a7e7b3281d3f77ef948d944ea0ae5f38d0e7235646",
      ];

      const tx = await gearboxClaimAndBrib
        .connect(keeper)
        .claim(6439, "0x4563918244f40000", merkleString);

      //console.log(tx);
    });
  });

  context("bribeAll", function () {
    it("should bribe all gauges", async function () {
      //   const { owner, keeper, mockERC20, gearboxClaimAndBrib } =
      //     await loadFixture(depolyContracts);

      console.log("before bribe");

      const address1 = "0x94f2bfbc27655Dd5489B42E2e5D84805E143ca95";
      const deployer1 = await ethers.getImpersonatedSigner(address1);

      await gearboxClaimAndBrib.connect(deployer1).setBribAllEnabled(true);

      // await mockERC20.mint(gearboxClaimAndBrib.address, TEST_AMOUNT);

      const geartoken = await ethers.getContractAt(
        "MockERC20",
        "0xBa3335588D9403515223F109EdC4eB7269a9Ab5D"
      );

      console.log(
        "balance",
        geartoken.address,
        await geartoken.balanceOf(gearboxClaimAndBrib.address)
      );

      console.log("test contract address", gearboxClaimAndBrib.address);

      const tx = await gearboxClaimAndBrib
        .connect(keeper)
        .bribAll(
          "0x3512436da14ed8278b9dfa252f13a38cdb9e86ff219d1e520507486858cfc891",
          "0x4735553b91be8926bebb90d63080bc66942e8b953232f2257272e60476f1d7dd",
          "0xBa3335588D9403515223F109EdC4eB7269a9Ab5D"
        );

      console.log(tx);
    });
  });
});
