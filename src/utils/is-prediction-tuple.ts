type PredictionTuple = [boolean, bigint, string, string];

export function isPredictionTuple(data: unknown): data is PredictionTuple {
  return Array.isArray(data) && data.length === 4 && 
    typeof data[0] === 'boolean' && 
    typeof data[1] === 'bigint' && 
    typeof data[2] === 'string' && 
    typeof data[3] === 'string';
}