const { ethers } = require("hardhat");

async function main() {
  const Orakul = await ethers.getContractAt("Orakul", "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9");
  const mockCoord = await ethers.getContractAt("MockVRFCoordinatorV2", "0x5FbDB2315678afecb367f032d93F642f64180aa3");
  
  console.log("Starting VRF auto-fulfillment script...");
  
  Orakul.on("PredictionRequested", async (requestId, sender, question) => {
    console.log(`Detected prediction request ID: ${requestId.toString()}`);
    console.log(`Sender: ${sender}`);
    console.log(`Question: ${question}`);
    
    // simulate real-world delay
    await new Promise(resolve => setTimeout(resolve, 2_500));
    
    try {
      const contractAddress = await Orakul.getAddress();
      const tx = await mockCoord.fulfillRandomWords(requestId, contractAddress);
      await tx.wait();
      console.log(`Fulfilled request ID: ${requestId.toString()}`);
    } catch (error) {
      console.error("Error fulfilling random words:", error.message);
    }
  });
  
  console.log("Listening for VRF requests...");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});