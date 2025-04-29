# Orakul

**Orakul** is an on-chain, verifiably random answer generator, powered by [Chainlink VRF](https://docs.chain.link/vrf).

Built as an educational web3 project, inspired by the [Magic 8 Ball](https://en.wikipedia.org/wiki/Magic_8_Ball).

## Features

- Front-end built with Next.js and tailwind, web3 integration through wagmi
- Smart contracts using Chainlink VRF for verifiable randomness
- Hardhat environment for local development and testing
- Minimalist, elegant UI/UX

## Local development

```bash
npm install
npm run blockchain # starts hardhat, deploys contracts, mocks VRF responses
npm run dev # run the front-end
```

## License

[MIT License](LICENSE)
