import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { EventLog } from "ethers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { MockVRFCoordinatorV2 } from "../typechain-types";

import { ContractTransactionResponse } from "ethers";

describe("Orakul ", function () {
  async function deployOrakulFixture() {
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

    // Deploy Orakul
    const keyHash = "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c";
    const callbackGasLimit = 100000;

    const Orakul = await ethers.getContractFactory("Orakul");
    const orakul = await Orakul.deploy(
      await mockCoordinator.getAddress(),
      subscriptionId,
      keyHash,
      callbackGasLimit
    );

    // Add Orakul as VRF consumer
    await mockCoordinator.addConsumer(subscriptionId, await orakul.getAddress());

    const [owner, sender] = await ethers.getSigners();
    return { orakul, mockCoordinator, owner, sender, subscriptionId };
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
      const { orakul } = await loadFixture(deployOrakulFixture);
      expect(await orakul.getAddress()).to.be.properAddress;
    });

    it("Should have correct number of outcomes", async function () {
      const { orakul } = await loadFixture(deployOrakulFixture);
      expect(await orakul.getTotalOutcomes()).to.equal(99);
    });

    it("Should have correct max question length", async function () {
      const { orakul } = await loadFixture(deployOrakulFixture);
      expect(await orakul.getMaxQuestionLength()).to.equal(120);
    });
  });

  describe("Asking a Question", function () {
    it("Should emit PredictionRequested when asking a question", async function () {
      const { orakul, sender } = await loadFixture(deployOrakulFixture);
      const question = "will my wife come back if I double my portfolio?";
    
      await expect(orakul.connect(sender).askQuestion(question))
        .to.emit(orakul, "PredictionRequested")
        .withArgs(anyValue, sender.address, question);
    });

    it("Should store prediction request details correctly", async function () {
      const { orakul, sender } = await loadFixture(deployOrakulFixture);
      const question = "should I buy this L2 token or just burn the money directly?";
      
      const tx = await orakul.connect(sender).askQuestion(question);
      const requestId = await getRequestId(tx);

      const prediction = await orakul.predictions(requestId);
      expect(prediction.fulfilled).to.be.false;
      expect(prediction.outcomeIndex).to.equal(0);
      expect(prediction.sender).to.equal(sender.address);
      expect(prediction.question).to.equal(question);
    });

    it("Should reject empty questions", async function () {
      const { orakul, sender } = await loadFixture(deployOrakulFixture);
      
      await expect(orakul.connect(sender).askQuestion(""))
        .to.be.revertedWith("Question cannot be empty");
    });

    it("Should reject questions that are too long", async function () {
      const { orakul, sender } = await loadFixture(deployOrakulFixture);
      
      // Create a question that's longer than the maximum allowed length
      const maxLength = await orakul.getMaxQuestionLength();
      const longQuestion = "?".repeat(Number(maxLength) + 1);
      
      await expect(orakul.connect(sender).askQuestion(longQuestion))
        .to.be.revertedWith("Question too long");
    });

    it("Should fulfill random request and emit result", async function () {
      const { orakul, mockCoordinator, sender } = await loadFixture(deployOrakulFixture);
      const question = "will this founder dump on me before or after mainnet?";
      
      const tx = await orakul.connect(sender).askQuestion(question);
      const requestId = await getRequestId(tx);

      const randomWords = [4n]; 
      
      // Use fulfillRandomWordsWithOverride to provide specific random values
      await expect(mockCoordinator.fulfillRandomWordsWithOverride(
        requestId,
        await orakul.getAddress(),
        randomWords
      ))
        .to.emit(orakul, "PredictionResult")
        .withArgs(requestId, 4);

      const prediction = await orakul.predictions(requestId);
      expect(prediction.fulfilled).to.be.true;
      expect(prediction.outcomeIndex).to.equal(4);
      expect(prediction.sender).to.equal(sender.address);
      expect(prediction.question).to.equal(question);
    });

    it("Should not allow fulfilling same request twice", async function () {
      const { orakul, mockCoordinator, sender } = await loadFixture(deployOrakulFixture);
      
      const tx = await orakul.connect(sender).askQuestion("was that top signal or am I just bad at this?");
      const requestId = await getRequestId(tx);

      // First fulfillment with fixed random value
      const randomWords = [2n];
      await mockCoordinator.fulfillRandomWordsWithOverride(
        requestId,
        await orakul.getAddress(),
        randomWords
      );

      // Second fulfillment should fail 
      await expect(
        mockCoordinator.fulfillRandomWordsWithOverride(
          requestId,
          await orakul.getAddress(),
          randomWords
        )
      ).to.be.revertedWith("nonexistent request");
    });
  });

  describe("Getting Results", function () {
    it("Should return correct prediction result with question", async function () {
      const { orakul, mockCoordinator, sender } = await loadFixture(deployOrakulFixture);
      const question = "will my stablecoin still be stable tomorrow?";
      
      const tx = await orakul.connect(sender).askQuestion(question);
      const requestId = await getRequestId(tx);

      // Fulfill with fixed random value
      const randomWords = [7n]; 
      await mockCoordinator.fulfillRandomWordsWithOverride(
        requestId,
        await orakul.getAddress(),
        randomWords
      );

      const [fulfilled, outcomeIndex, resultSender, resultQuestion] = await orakul.getPredictionResult(requestId);
      expect(fulfilled).to.be.true;
      expect(outcomeIndex).to.equal(7);
      expect(resultSender).to.equal(sender.address);
      expect(resultQuestion).to.equal(question);
    });

    it("Should return default values for non-existent prediction", async function () {
      const { orakul } = await loadFixture(deployOrakulFixture);
      
      const [fulfilled, outcomeIndex, sender, question] = await orakul.getPredictionResult(999);
      expect(fulfilled).to.be.false;
      expect(outcomeIndex).to.equal(0);
      expect(sender).to.equal(ethers.ZeroAddress);
      expect(question).to.equal("");
    });
  });
});
