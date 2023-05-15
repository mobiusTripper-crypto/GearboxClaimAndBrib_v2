import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const TOKENS_IN_GEARBOX_TREE = ethers.utils.parseEther("15");

describe("Test ClaimAndBrib Contract", function () {
  async function depolyContracts() {
    const [deployer, owner, tree, keeper, placeholderAddress] =
      await ethers.getSigners();

    const mockERC20Factory = await ethers.getContractFactory("MockERC20");
    const mockERC20 = await mockERC20Factory.deploy(
      "MockERC20",
      "ME2",
      deployer.address,
      ethers.utils.parseUnits("10000", 18) // inital mock token balance
    );

    const gearboxClaimAndBribFactory = await ethers.getContractFactory(
      "GearboxClaimAndBrib"
    );

    //TODO: added legitimate values for constructor
    const gearboxClaimAndBrib = await gearboxClaimAndBribFactory.deploy(
      keeper.address,
      placeholderAddress.address,
      placeholderAddress.address,
      placeholderAddress.address,
      0,
      14 * 24 * 60 * 60 // 2 weeks in seconds
    );

    // load "tree" with initial tokens
    await mockERC20.transfer(tree.address, TOKENS_IN_GEARBOX_TREE);

    return { owner, tree, mockERC20, gearboxClaimAndBrib };
  }

  describe("sweep", function () {
    it("Should sweep the correct amount of tokens", async function () {
      const { owner, tree, mockERC20, gearboxClaimAndBrib } = await loadFixture(
        depolyContracts
      );
      const amount = await mockERC20.balanceOf(tree.address);

      mockERC20.transfer(gearboxClaimAndBrib.address, amount);

      await gearboxClaimAndBrib.sweep(mockERC20.address, owner.address);

      expect(await mockERC20.balanceOf(owner.address)).to.equal(amount);
    });

    it("Should have zero balance after sweep", async function () {
      const { owner, tree, mockERC20, gearboxClaimAndBrib } = await loadFixture(
        depolyContracts
      );
      const amount = await mockERC20.balanceOf(tree.address);

      mockERC20.transfer(gearboxClaimAndBrib.address, amount);

      await gearboxClaimAndBrib.sweep(mockERC20.address, owner.address);

      expect(await mockERC20.balanceOf(gearboxClaimAndBrib.address)).to.equal(
        0
      );
    });
  });
});
