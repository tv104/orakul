import { isValidAddress } from "./code-safety";

export function isOutcomeIndexInFirstLog(log: unknown): log is [{ args: { outcomeIndex: number } }, ...unknown[]] {
    if (!Array.isArray(log) || log.length === 0) {
        return false;
    }

    const firstLog = log[0];

    if (typeof firstLog !== 'object' || firstLog === null) {
        return false;
    }

    if (!('args' in firstLog) || typeof firstLog.args !== 'object' || firstLog.args === null) {
        return false;
    }

    return typeof firstLog.args.outcomeIndex === 'number';
}

export function isNewRequestIdInFirstLog(log: unknown): log is [{ topics: [unknown, `0x${string}`] }, ...unknown[]] {
    if (!Array.isArray(log) || log.length === 0) {
      return false;
    }
  
    const firstLog = log[0];
    
    if (typeof firstLog !== 'object' || firstLog === null) {
      return false;
    }
    
    if (!('topics' in firstLog) || !Array.isArray(firstLog.topics) || firstLog.topics.length < 2) {
      return false;
    }
    
    return isValidAddress(firstLog.topics[1]);
}
