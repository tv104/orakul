# Magic 8 VRF

**Magic 8 VRF** is an on-chain, verifiable version of the classic Magic 8 Ball, powered by [Chainlink VRF](https://docs.chain.link/vrf).

Ask your question, get an answer with guaranteed randomness.

## Features

- Front-end built with Next.js and tailwind, web3 integration through wagmi
- Smart contracts using Chainlink VRF for verifiable randomness
- Hardhat environment for local development and testing
- Minimalist, elegant UI/UX

## Local development

```bash
npm install
npm run node # local hardhat environment
npm run deploy-magic8vrf-local # deploy smart contracts locally
npm run auto-fulfill-vrf # mock VRF responses
npm run dev # run the front-end
```

## License

[MIT License](LICENSE)
