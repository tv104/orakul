import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { EventLog } from "ethers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { MockVRFCoordinatorV2 } from "../typechain-types";

import { ContractTransactionResponse } from "ethers";

describe("Magic8Ball", function () {
  async function deployMagic8BallFixture() {
    // Deploy the mock VRF Coordinator
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

    // Deploy Magic8Ball
    const keyHash = "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c";
    const callbackGasLimit = 100000;

    const Magic8Ball = await ethers.getContractFactory("Magic8Ball");
    const magic8Ball = await Magic8Ball.deploy(
      await mockCoordinator.getAddress(),
      subscriptionId,
      keyHash,
      callbackGasLimit
    );

    // Add Magic8Ball as VRF consumer
    await mockCoordinator.addConsumer(subscriptionId, await magic8Ball.getAddress());

    // Get signers
    const [owner, player] = await ethers.getSigners();

    return { magic8Ball, mockCoordinator, owner, player, subscriptionId };
  }

  // Helper function to extract requestId from transaction receipt
  async function getRequestId(tx: ContractTransactionResponse) {
    const receipt = await tx.wait();
    
    const requestEvent = receipt?.logs.find(log => {
      try {
        return log instanceof EventLog && log.eventName === "PredictionRequested";
      } catch {
        return false;
      }
    }) as EventLog | undefined;
    
    if (!requestEvent) {
      throw new Error("PredictionRequested event not found in logs");
    }
    
    return requestEvent.args[0];
  }

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      const { magic8Ball } = await loadFixture(deployMagic8BallFixture);
      expect(await magic8Ball.getAddress()).to.be.properAddress;
    });

    it("Should have correct number of outcomes", async function () {
      const { magic8Ball } = await loadFixture(deployMagic8BallFixture);
      expect(await magic8Ball.getTotalOutcomes()).to.equal(20);
    });

    it("Should have correct max question length", async function () {
      const { magic8Ball } = await loadFixture(deployMagic8BallFixture);
      expect(await magic8Ball.getMaxQuestionLength()).to.equal(120);
    });
  });

  describe("Asking a Question", function () {
    it("Should emit PredictionRequested when asking a question", async function () {
      const { magic8Ball, player } = await loadFixture(deployMagic8BallFixture);
      const question = "will my wife come back if I double my portfolio?";
    
      await expect(magic8Ball.connect(player).askQuestion(question))
        .to.emit(magic8Ball, "PredictionRequested")
        .withArgs(anyValue, player.address, question);
    });

    it("Should store prediction request details correctly", async function () {
      const { magic8Ball, player } = await loadFixture(deployMagic8BallFixture);
      const question = "should I buy this L2 token or just burn the money directly?";
      
      const tx = await magic8Ball.connect(player).askQuestion(question);
      const requestId = await getRequestId(tx);

      const prediction = await magic8Ball.predictions(requestId);
      expect(prediction.fulfilled).to.be.false;
      expect(prediction.outcomeIndex).to.equal(0);
      expect(prediction.player).to.equal(player.address);
      expect(prediction.question).to.equal(question);
    });

    it("Should reject empty questions", async function () {
      const { magic8Ball, player } = await loadFixture(deployMagic8BallFixture);
      
      await expect(magic8Ball.connect(player).askQuestion(""))
        .to.be.revertedWith("Question cannot be empty");
    });

    it("Should reject questions that are too long", async function () {
      const { magic8Ball, player } = await loadFixture(deployMagic8BallFixture);
      
      // Create a question that's longer than the maximum allowed length
      const maxLength = await magic8Ball.getMaxQuestionLength();
      const longQuestion = "?".repeat(Number(maxLength) + 1);
      
      await expect(magic8Ball.connect(player).askQuestion(longQuestion))
        .to.be.revertedWith("Question too long");
    });

    it("Should fulfill random request and emit result", async function () {
      const { magic8Ball, mockCoordinator, player } = await loadFixture(deployMagic8BallFixture);
      const question = "will this founder dump on me before or after mainnet?";
      
      const tx = await magic8Ball.connect(player).askQuestion(question);
      const requestId = await getRequestId(tx);

      const randomWords = [4n]; 
      
      // Use fulfillRandomWordsWithOverride to provide specific random values
      await expect(mockCoordinator.fulfillRandomWordsWithOverride(
        requestId,
        await magic8Ball.getAddress(),
        randomWords
      ))
        .to.emit(magic8Ball, "PredictionResult")
        .withArgs(requestId, 4);

      const prediction = await magic8Ball.predictions(requestId);
      expect(prediction.fulfilled).to.be.true;
      expect(prediction.outcomeIndex).to.equal(4);
      expect(prediction.player).to.equal(player.address);
      expect(prediction.question).to.equal(question);
    });

    it("Should not allow fulfilling same request twice", async function () {
      const { magic8Ball, mockCoordinator, player } = await loadFixture(deployMagic8BallFixture);
      
      const tx = await magic8Ball.connect(player).askQuestion("was that top signal or am I just bad at this?");
      const requestId = await getRequestId(tx);

      // First fulfillment with fixed random value
      const randomWords = [2n];
      await mockCoordinator.fulfillRandomWordsWithOverride(
        requestId,
        await magic8Ball.getAddress(),
        randomWords
      );

      // Second fulfillment should fail 
      await expect(
        mockCoordinator.fulfillRandomWordsWithOverride(
          requestId,
          await magic8Ball.getAddress(),
          randomWords
        )
      ).to.be.revertedWith("nonexistent request");
    });
  });

  describe("Getting Results", function () {
    it("Should return correct prediction result with question", async function () {
      const { magic8Ball, mockCoordinator, player } = await loadFixture(deployMagic8BallFixture);
      const question = "will my stablecoin still be stable tomorrow?";
      
      const tx = await magic8Ball.connect(player).askQuestion(question);
      const requestId = await getRequestId(tx);

      // Fulfill with fixed random value
      const randomWords = [7n]; 
      await mockCoordinator.fulfillRandomWordsWithOverride(
        requestId,
        await magic8Ball.getAddress(),
        randomWords
      );

      const [fulfilled, outcomeIndex, resultPlayer, resultQuestion] = await magic8Ball.getPredictionResult(requestId);
      expect(fulfilled).to.be.true;
      expect(outcomeIndex).to.equal(7);
      expect(resultPlayer).to.equal(player.address);
      expect(resultQuestion).to.equal(question);
    });

    it("Should return default values for non-existent prediction", async function () {
      const { magic8Ball } = await loadFixture(deployMagic8BallFixture);
      
      const [fulfilled, outcomeIndex, player, question] = await magic8Ball.getPredictionResult(999);
      expect(fulfilled).to.be.false;
      expect(outcomeIndex).to.equal(0);
      expect(player).to.equal(ethers.ZeroAddress);
      expect(question).to.equal("");
    });
  });
});
