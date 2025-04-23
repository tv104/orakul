// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";

contract CoinFlip is VRFConsumerBaseV2 {
    // Chainlink VRF variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_keyHash;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // Coinflip variables
    struct FlipStatus {
        bool fulfilled;
        bool heads; // true for heads, false for tails
        address player;
    }

    mapping(uint256 => FlipStatus) public flips;
    uint256 public lastRequestId;

    event CoinFlipRequested(uint256 indexed requestId, address indexed player);
    event CoinFlipResult(uint256 indexed requestId, bool heads);

    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 keyHash,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_keyHash = keyHash;
        i_callbackGasLimit = callbackGasLimit;
    }

    // Request a random number for the coin flip
    function flipCoin() external returns (uint256 requestId) {
        requestId = i_vrfCoordinator.requestRandomWords(
            i_keyHash,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );

        flips[requestId] = FlipStatus({
            fulfilled: false,
            heads: false,
            player: msg.sender
        });

        lastRequestId = requestId;
        emit CoinFlipRequested(requestId, msg.sender);
        return requestId;
    }

    // Callback function called by the VRF Coordinator
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        require(!flips[requestId].fulfilled, "Request already fulfilled");

        // Use the random word to determine heads or tails
        bool heads = randomWords[0] % 2 == 0;
        flips[requestId].fulfilled = true;
        flips[requestId].heads = heads;

        emit CoinFlipResult(requestId, heads);
    }

    // Get the result of a specific flip
    function getFlipResult(
        uint256 requestId
    ) external view returns (bool fulfilled, bool heads, address player) {
        FlipStatus memory flip = flips[requestId];
        return (flip.fulfilled, flip.heads, flip.player);
    }
}
