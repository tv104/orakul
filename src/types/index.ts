export interface Prediction {
    fulfilled: boolean;
    outcomeIndex: number;
    player: string;
    question: string;
}

export interface PredictionResult {
    fulfilled: boolean;
    outcomeIndex: number;
    player: string;
    question: string;
    answer: string;
}

