import { isValidAddress } from "./code-safety";

export function isOutcomeIndexLogForRequestId(
  log: unknown, 
  requestId: `0x${string}`
): log is [{ topics: [unknown, `0x${string}`], args: { outcomeIndex: number } }, ...unknown[]] {
  if (!Array.isArray(log) || log.length === 0) {
    return false;
  }

  const firstLog = log[0];

  if (typeof firstLog !== 'object' || firstLog === null) {
    return false;
  }

  if (!('topics' in firstLog) || 
      !Array.isArray(firstLog.topics) || 
      firstLog.topics.length < 2 || 
      firstLog.topics[1] !== requestId) {
    return false;
  }

  if (!('args' in firstLog) || 
      typeof firstLog.args !== 'object' || 
      firstLog.args === null) {
    return false;
  }

  return typeof firstLog.args.outcomeIndex === 'number';
}

export function isRequestIdLogForTransaction(
  log: unknown,
  txHash: `0x${string}`
): log is [{ transactionHash: `0x${string}`, topics: [unknown, `0x${string}`] }, ...unknown[]] {
  if (!Array.isArray(log) || log.length === 0) {
    return false;
  }

  const firstLog = log[0];

  if (typeof firstLog !== 'object' || firstLog === null) {
    return false;
  }

  if (!('transactionHash' in firstLog) || 
      typeof firstLog.transactionHash !== 'string' || 
      firstLog.transactionHash !== txHash) {
    return false;
  }

  if (!('topics' in firstLog) || 
      !Array.isArray(firstLog.topics) || 
      firstLog.topics.length < 2) {
    return false;
  }

  return isValidAddress(firstLog.topics[1]);
}
