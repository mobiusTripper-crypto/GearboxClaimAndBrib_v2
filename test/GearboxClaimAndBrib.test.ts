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

    await deployments.fixture();

    gearboxClaimAndBrib = await ethers.getContract("GearboxClaimAndBrib");

    console.log("address", gearboxClaimAndBrib.address);

    await gearboxClaimAndBrib.setGearboxTree(
      "0xA7Df60785e556d65292A2c9A077bb3A8fBF048BC"
    );
    await gearboxClaimAndBrib.transferOwnership(owner.address);
    await gearboxClaimAndBrib.connect(owner).acceptOwnership();
  });

  context("constructor", () => {
    it(`constructor sets correct parameters`, async () => {
      expect(await gearboxClaimAndBrib.keeperAddress()).to.be.eq(
        keeper.address,
        "keeperAddress constructor parameter not set correctly"
      );
      expect(await gearboxClaimAndBrib.auraHHBriber()).to.be.eq(
        "0x642c59937A62cf7dc92F70Fd78A13cEe0aa2Bd9c",
        "auraHHBriber constructor parameter not set correctly"
      );
      expect(await gearboxClaimAndBrib.balHHBriber()).to.be.eq(
        "0x7Cdf753b45AB0729bcFe33DC12401E55d28308A9",
        "balHHBriber constructor parameter not set correctly"
      );
      expect(await gearboxClaimAndBrib.HHVault()).to.be.eq(
        keeper.address,
        "HHVault constructor parameter not set correctly"
      );
      expect(await gearboxClaimAndBrib.pct_bal_bps()).to.be.eq(
        50,
        "pct_bal_bps constructor parameter not set correctly"
      );
      expect(await gearboxClaimAndBrib.minWaitPeriodSeconds()).to.be.eq(
        100,
        "minWaitPeriodSeconds constructor parameter not set correctly"
      );
    });
  });

  context("sweep", () => {
    it("correct amount of tokens swept to account, and zero balance in contract", async function () {
      //   const { mockERC20, owner, randomUser, gearboxClaimAndBrib } =
      //     await loadFixture(depolyContracts);

      await mockERC20.mint(gearboxClaimAndBrib.address, TEST_AMOUNT);

      await gearboxClaimAndBrib
        .connect(owner)
        .sweep(mockERC20.address, randomUser.address);

      expect(
        await mockERC20.balanceOf(randomUser.address),
        "swept balance incorrect"
      ).to.equal(TEST_AMOUNT);

      expect(
        await mockERC20.balanceOf(gearboxClaimAndBrib.address),
        "contract balance to be zero"
      ).to.equal(0);
    });

    it("revert if not owner", async function () {
      //   const { mockERC20, randomUser, gearboxClaimAndBrib } = await loadFixture(
      //     depolyContracts
      //   );

      await expect(
        gearboxClaimAndBrib
          .connect(randomUser)
          .sweep(mockERC20.address, randomUser.address)
      ).to.be.revertedWith("Only callable by owner");
    });
  });

  context("claim", function () {
    it("should claim tokens from gearbox", async function () {
      const merkleString = [
        "0x44ac5b5555a7e948cd827e48942ff8c4b867357c6ba905f180bf8e80fc566ae8",
        "0x080c20bcc6bff41507f8e734a0e34f6dedab17ec8882a5de3c8901496efdf433",
        "0xd261b08c9b828bf6391cc70f85970e7928689af4c41956e732b38a8ba383b724",
        "0x6877035ccab2f1c57d66c479a6dfec12143e8365263c820f3437d40695007dc4",
        "0xab24fc4d2cd8d9d7a997940e6f4e2ceee57c3542d5f4629dac5f5a3ab4c35668",
        "0xe0c02accd52abc174c470d7ec45af613fc3ef25c4dcbd883f2dc2989f9377634",
        "0x8fb375bccb62e30803f185fa548991dc5f769ced8abeccf4ee8d679897bd404e",
        "0x7df5ac9aabdf474ee57fea7eae4b2496fab57b942c77a80940e7a43aebcb3188",
        "0x55379f522652d2778fd3c5a07115d2dc08e40bdd4b6644a4e31579d7fae7d959",
        "0x89fb64a5de8c31444198217b2224f1dd007be0c2ca9446e5f66b29f5ab4cacbb",
        "0x1245f7dbdf3e9b5361304121cdda07eb09ff8190ffa79730a9b3c236013772b8",
        "0xbe1e846b9e5066b5aaa1cf54be9426c1933220784576afa6e297db779fb8ff91",
        "0xbcece4b588795ccb1dfe3c2603dbee199f7a7c0d0276f1fe687b18d93b25ca79",
      ];

      const tx = await gearboxClaimAndBrib
        .connect(keeper)
        .claim(6928, "0x01d8d530771770b7333ecb", merkleString);

      console.log(tx);
    });
  });

  //   context("bribeAll", function () {
  //     it("should bribe all gauges", async function () {
  //       //   const { owner, keeper, mockERC20, gearboxClaimAndBrib } =
  //       //     await loadFixture(depolyContracts);

  //       console.log("before bribe");

  //       await gearboxClaimAndBrib.connect(owner).setBribAllEnabled(true);

  //       await mockERC20.mint(gearboxClaimAndBrib.address, TEST_AMOUNT);

  //       const tx = await gearboxClaimAndBrib.connect(keeper).bribAll(
  //         "0xc3232191a86bea1ff4aeb8c8fe180cbd3ca0503d1176a47b622f4b2434da055a",
  //         "0x4735553b91be8926bebb90d63080bc66942e8b953232f2257272e60476f1d7dd",
  //         //          "0xBa3335588D9403515223F109EdC4eB7269a9Ab5D"
  //         mockERC20.address
  //       );

  //       console.log(tx);
  //     });
  //   });
});
