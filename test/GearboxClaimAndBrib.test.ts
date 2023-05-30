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
        "0xbbc4f4deb86d81f45aad22073990d13c8dde74b94a848177e9d2ba0f4135a517",
        "0x40b4cf25b6d3413375d8261bc0ac7a50b1475ecd84eb384641aa3406f9656ebb",
        "0xfadd5b14608f42ce1a1cd9ee13a0d69e0882b5025a0095cb6c973b1246413c5b",
        "0x4823e5a8c8923c3dbfb63a7fa5b5d68bd2a35fb5b61ebceb70faa90b3d7f526d",
        "0x072aa7aaf91a595b1a0188206f0ad22667f8d28a3e666794abfcea0a1d65c48a",
        "0x109a95bb4cdf4dba5504feb641347498704eeb0cd8fe46beee6139429d3293fe",
        "0x0ed84c7fcd143b096195e34549739bbf459cc5c96efb2d254657c28afa4ace46",
        "0x57fab112daf087d2cf2f623b537095982e281805e2a465a42810c1c51a1c2da2",
        "0x485f12cab8aa3f29273669b3a391fbc1f63a05fa4e05287b0aaeb57514f8b94e",
        "0x77f5b03f36ef8c06f4cd92207d0fa72b93b3e196e53c851cb04109d89e1beabb",
        "0xdfcf4a2074409c3928055fbc5cb01ebb8ae607358988f9427ea5458397257457",
        "0x392cc567fdbba95c751e39eab88b3ec0cee29628826c7189236f0e0fb4f77516",
        "0x0a9d23624ba6112145c278e34411db55cf546f62a0ec8432637028751d7707c1",
      ];

      const tx = await gearboxClaimAndBrib
        .connect(keeper)
        .claim(7022, "0x0250d84147f64dea48bcd3", merkleString);

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

      await mockERC20.mint(gearboxClaimAndBrib.address, TEST_AMOUNT);

      const tx = await gearboxClaimAndBrib
        .connect(keeper)
        .bribAll(
          "0x3512436da14ed8278b9dfa252f13a38cdb9e86ff219d1e520507486858cfc891",
          "0x4735553b91be8926bebb90d63080bc66942e8b953232f2257272e60476f1d7dd",
          mockERC20.address
        );

      console.log(tx);
    });
  });
});
