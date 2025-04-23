import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { EventLog } from "ethers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { MockVRFCoordinatorV2 } from "../typechain-types";

// Add ContractTransactionResponse type
import { ContractTransactionResponse } from "ethers";

describe("CoinFlip", function () {
  // We define a fixture to reuse the same setup in every test
  async function deployCoinFlipFixture() {
    // First deploy the mock VRF Coordinator
    const MockVRFCoordinator = await ethers.getContractFactory("MockVRFCoordinatorV2");
    const mockCoordinator = await MockVRFCoordinator.deploy(
      ethers.parseEther("0.0001"),
      ethers.parseEther("0.000000000000000001")
    ) as MockVRFCoordinatorV2;

    // Setup VRF subscription
    const subscriptionId = 1n;
    await mockCoordinator.createSubscription();
    await mockCoordinator.fundSubscription(
      subscriptionId,
      ethers.parseEther("10")
    );

    // Deploy CoinFlip
    const keyHash = "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c";
    const callbackGasLimit = 100000;

    const CoinFlip = await ethers.getContractFactory("CoinFlip");
    const coinFlip = await CoinFlip.deploy(
      await mockCoordinator.getAddress(),
      subscriptionId,
      keyHash,
      callbackGasLimit
    );

    // Add CoinFlip as VRF consumer
    await mockCoordinator.addConsumer(subscriptionId, await coinFlip.getAddress());

    // Get signers
    const [owner, player] = await ethers.getSigners();

    return { coinFlip, mockCoordinator, owner, player, subscriptionId };
  }

  // Helper function to extract requestId from transaction receipt
  async function getRequestId(tx: ContractTransactionResponse) {
    const receipt = await tx.wait();
    
    // Look for the CoinFlipRequested event
    const requestEvent = receipt?.logs.find(log => {
      try {
        return log instanceof EventLog && log.eventName === "CoinFlipRequested";
      } catch {
        return false;
      }
    }) as EventLog | undefined;
    
    if (!requestEvent) {
      throw new Error("CoinFlipRequested event not found in logs");
    }
    
    return requestEvent.args[0];
  }

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      const { coinFlip } = await loadFixture(deployCoinFlipFixture);
      expect(await coinFlip.getAddress()).to.be.properAddress;
    });
  });

  describe("Flipping", function () {
    it("Should emit CoinFlipRequested when requesting a flip", async function () {
      const { coinFlip, player } = await loadFixture(deployCoinFlipFixture);
    
      await expect(coinFlip.connect(player).flipCoin())
        .to.emit(coinFlip, "CoinFlipRequested")
        .withArgs(anyValue, player.address);
    });

    it("Should store flip request details correctly", async function () {
      const { coinFlip, player } = await loadFixture(deployCoinFlipFixture);
      
      const tx = await coinFlip.connect(player).flipCoin();
      const requestId = await getRequestId(tx);

      const flip = await coinFlip.flips(requestId);
      expect(flip.fulfilled).to.be.false;
      expect(flip.player).to.equal(player.address);
    });

    it("Should fulfill random request and emit result", async function () {
      const { coinFlip, mockCoordinator, player } = await loadFixture(deployCoinFlipFixture);
      
      // Request flip
      const tx = await coinFlip.connect(player).flipCoin();
      const requestId = await getRequestId(tx);

      // Generate an even number for the test (to get "heads" result)
      const randomWords = [2n]; // Even number should result in heads=true
      
      // Use fulfillRandomWordsWithOverride to provide specific random values
      await expect(mockCoordinator.fulfillRandomWordsWithOverride(
        requestId,
        await coinFlip.getAddress(),
        randomWords
      ))
        .to.emit(coinFlip, "CoinFlipResult")
        .withArgs(requestId, true); // true for heads since we used even number

      // Verify flip status
      const flip = await coinFlip.flips(requestId);
      expect(flip.fulfilled).to.be.true;
      expect(flip.heads).to.be.true;
      expect(flip.player).to.equal(player.address);
    });

    it("Should not allow fulfilling same request twice", async function () {
      const { coinFlip, mockCoordinator, player } = await loadFixture(deployCoinFlipFixture);
      
      const tx = await coinFlip.connect(player).flipCoin();
      const requestId = await getRequestId(tx);

      // First fulfillment with fixed random value
      const randomWords = [2n]; // Even number should result in heads=true
      await mockCoordinator.fulfillRandomWordsWithOverride(
        requestId,
        await coinFlip.getAddress(),
        randomWords
      );

      // Second fulfillment should fail with the correct error message from the mock coordinator
      await expect(
        mockCoordinator.fulfillRandomWordsWithOverride(
          requestId,
          await coinFlip.getAddress(),
          randomWords
        )
      ).to.be.revertedWith("nonexistent request");
    });
  });

  describe("Getting Results", function () {
    it("Should return correct flip result", async function () {
      const { coinFlip, mockCoordinator, player } = await loadFixture(deployCoinFlipFixture);
      
      const tx = await coinFlip.connect(player).flipCoin();
      const requestId = await getRequestId(tx);

      // Fulfill with fixed random value
      const randomWords = [2n]; // Even number should result in heads=true
      await mockCoordinator.fulfillRandomWordsWithOverride(
        requestId,
        await coinFlip.getAddress(),
        randomWords
      );

      const [fulfilled, heads, resultPlayer] = await coinFlip.getFlipResult(requestId);
      expect(fulfilled).to.be.true;
      expect(heads).to.be.true;
      expect(resultPlayer).to.equal(player.address);
    });

    it("Should return default values for non-existent flip", async function () {
      const { coinFlip } = await loadFixture(deployCoinFlipFixture);
      
      const [fulfilled, heads, player] = await coinFlip.getFlipResult(999);
      expect(fulfilled).to.be.false;
      expect(heads).to.be.false;
      expect(player).to.equal(ethers.ZeroAddress);
    });
  });
});
