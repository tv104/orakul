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


export function isValidAddress(address: unknown): address is `0x${string}` {
    if (typeof address !== 'string' || !address.startsWith("0x")) {
        return false;
    }
    
    return true
}

export function assertValidAddress(address: unknown): asserts address is `0x${string}` {
    if (!isValidAddress(address)) {
        throw new Error("Address is not a valid Ethereum address");
    }
}

