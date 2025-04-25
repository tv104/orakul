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

  // Deploy the Magic8Ball contract
  const keyHash = "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c";
  const callbackGasLimit = 100000;
  
  const Magic8Ball = await hre.ethers.getContractFactory("Magic8Ball");
  const magic8Ball = await Magic8Ball.deploy(
    await mockCoordinator.getAddress(),
    subscriptionId,
    keyHash,
    callbackGasLimit
  );

  await magic8Ball.waitForDeployment();
  console.log("Magic8Ball deployed to:", await magic8Ball.getAddress());

  // Add the consumer to the subscription
  await mockCoordinator.addConsumer(subscriptionId, await magic8Ball.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});