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


