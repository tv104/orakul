import { assertNotUndefined, assertValidAddress } from "./code-safety";

assertNotUndefined(
    process.env.NEXT_PUBLIC_HARDHAT_RPC_URL,
    "HARDHAT_RPC_URL is not defined"
);

assertNotUndefined(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS, 
    "NEXT_PUBLIC_CONTRACT_ADDRESS is not defined"
);

assertValidAddress(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);

export const envConfig = {
    NEXT_PUBLIC_HARDHAT_RPC_URL: process.env.NEXT_PUBLIC_HARDHAT_RPC_URL,
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
}

