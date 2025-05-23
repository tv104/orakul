import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const isTest = process.env.HARDHAT_TEST === "true";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  paths: {
    artifacts: '../src/artifacts',
    sources: "./contracts",
    cache: "./cache",
    tests: "./test"
  },
  networks: {
    hardhat: {
      chainId: 31337,
      mining: {
        auto: isTest,
        interval: isTest ? undefined : 1000
      }
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337
    }
  },
};

export default config;
