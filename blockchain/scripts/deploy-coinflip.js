const hre = require("hardhat");

async function main() {
  // Deploy a mock VRF Coordinator first (for local testing)
  const MockVRFCoordinator = await hre.ethers.getContractFactory("MockVRFCoordinatorV2");
  const mockCoordinator = await MockVRFCoordinator.deploy(
    hre.ethers.parseEther("0.0001"),     // Base fee
    hre.ethers.parseEther("0.000000000000000001")  // Gas price link
  );
  await mockCoordinator.waitForDeployment();
  console.log("Mock VRF Coordinator deployed to:", await mockCoordinator.getAddress());

  // Create a subscription on the mock coordinator
  const tx = await mockCoordinator.createSubscription();
  await tx.wait();
  const subscriptionId = 1n;

  // Fund the subscription
  await mockCoordinator.fundSubscription(subscriptionId, hre.ethers.parseEther("10"));

  // Deploy the CoinFlip contract
  const keyHash = "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c";
  const callbackGasLimit = 100000;
  
  const CoinFlip = await hre.ethers.getContractFactory("CoinFlip");
  const coinFlip = await CoinFlip.deploy(
    await mockCoordinator.getAddress(),
    subscriptionId,
    keyHash,
    callbackGasLimit
  );

  await coinFlip.waitForDeployment();
  console.log("CoinFlip deployed to:", await coinFlip.getAddress());

  // Add the consumer to the subscription
  await mockCoordinator.addConsumer(subscriptionId, await coinFlip.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});