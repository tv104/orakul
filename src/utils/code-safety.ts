export function assertNotNull<T>(value: T | null | undefined): asserts value is T {
    if (value === null || value === undefined) {
        throw new Error("Value is null or undefined");
    }
}

  
export function assertNotUndefined<T>(value: T | undefined, message: string): asserts value is T {
    if (value === undefined) {
        throw new Error(message);
    }
}

export function assertValidAddress(address: string): asserts address is `0x${string}` {
    if (!address.startsWith("0x")) {
        throw new Error("Address is not a valid Ethereum address");
    }
}

export function isOutcomeIndexInLog(log: unknown): log is { args: { outcomeIndex: number } } {
    if (typeof log !== 'object' || log === null) {
      return false;
    }
    
    const typedLog = log as Record<string, unknown>;
    
    // Check if args exists and is an object
    if (!typedLog.args || typeof typedLog.args !== 'object' || typedLog.args === null) {
      return false;
    }
    
    // Check if args.outcomeIndex exists and is a number
    const args = typedLog.args as Record<string, unknown>;
    return 'outcomeIndex' in args && typeof args.outcomeIndex === 'number';
  }
