# Orakul

Work in progress. Things to do
- Error handlings like timeouts
- Improve ThreeJS perf
- Page with previous questions/answers

**Orakul** is a verifiably random answer generator powered by [Chainlink VRF](https://docs.chain.link/vrf) and built with Next.js.

[orakul.webm](https://github.com/user-attachments/assets/64f19a2e-6069-4f2f-b450-7608f0de3d59)

Developed as a personal learning project to explore web3 technologies, inspired by the [Magic 8 Ball](https://en.wikipedia.org/wiki/Magic_8_Ball).

## Features

- Front-end built with Next.js and tailwind, web3 integration through wagmi
- Smart contracts using Chainlink VRF for verifiable randomness
- Hardhat environment for local development and testing
- Minimalist, elegant UI/UX

## Local development

```bash
git clone git@github.com:tv104/orakul.git
cd ./orakul
npm install
npm run blockchain # start hardhat, deploy contracts, mock VRF
npm run dev # run the front-end in a second terminal
```

## License

[MIT License](LICENSE)
