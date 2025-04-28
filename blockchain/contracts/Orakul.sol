// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";

/**
 * @title Orakul
 * @dev A contract that provides verifiable random index using Chainlink VRF
 */
contract Orakul is VRFConsumerBaseV2 {
    // Chainlink VRF variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_keyHash;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;
    uint8 private constant NUM_OUTCOMES = 20;
    uint256 private constant MAX_QUESTION_LENGTH = 120;

    struct PredictionStatus {
        bool fulfilled;
        uint8 outcomeIndex; // 0-19
        address player;
        string question;
    }

    mapping(uint256 => PredictionStatus) public predictions;
    uint256 public lastRequestId;

    event PredictionRequested(
        uint256 indexed requestId,
        address indexed player,
        string question
    );
    event PredictionResult(uint256 indexed requestId, uint8 outcomeIndex);

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

    // Request a random number for the prediction
    function askQuestion(
        string calldata question
    ) external returns (uint256 requestId) {
        require(bytes(question).length > 0, "Question cannot be empty");
        require(
            bytes(question).length <= MAX_QUESTION_LENGTH,
            "Question too long"
        );

        requestId = i_vrfCoordinator.requestRandomWords(
            i_keyHash,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );

        predictions[requestId] = PredictionStatus({
            fulfilled: false,
            outcomeIndex: 0,
            player: msg.sender,
            question: question
        });

        lastRequestId = requestId;
        emit PredictionRequested(requestId, msg.sender, question);
        return requestId;
    }

    // Callback function called by the VRF Coordinator
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        require(!predictions[requestId].fulfilled, "Request already fulfilled");

        // Use the random word to determine the outcome (0-19)
        uint8 outcomeIndex = uint8(randomWords[0] % NUM_OUTCOMES);
        predictions[requestId].fulfilled = true;
        predictions[requestId].outcomeIndex = outcomeIndex;

        emit PredictionResult(requestId, outcomeIndex);
    }

    function getPredictionResult(
        uint256 requestId
    )
        external
        view
        returns (
            bool fulfilled,
            uint8 outcomeIndex,
            address player,
            string memory question
        )
    {
        PredictionStatus memory prediction = predictions[requestId];
        return (
            prediction.fulfilled,
            prediction.outcomeIndex,
            prediction.player,
            prediction.question
        );
    }

    function getTotalOutcomes() external pure returns (uint8) {
        return NUM_OUTCOMES;
    }

    function getMaxQuestionLength() external pure returns (uint256) {
        return MAX_QUESTION_LENGTH;
    }
}
