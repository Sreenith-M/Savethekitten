/**
 * Test Helper for Save The Kitten
 * Works seamlessly with both Vitest and standalone Node.js test runners.
 */

import { describe as viteDescribe, it as viteIt, expect as viteExpect } from 'vitest';

export const describe = viteDescribe;
export const it = viteIt;
export const expect = viteExpect;

export function assert(condition, message = 'Assertion failed') {
    if (!condition) {
        throw new Error(message);
    }
}

export function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`${message || 'Values not equal'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
}

export function assertDeepEqual(actual, expected, message) {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr !== expectedStr) {
        throw new Error(`${message || 'Deep equality failed'}:\nExpected: ${expectedStr}\nActual:   ${actualStr}`);
    }
}

export function assertArrayEqualsIgnoreOrder(actual, expected, message) {
    if (!Array.isArray(actual) || !Array.isArray(expected)) {
        throw new Error(`${message || 'Both arguments must be arrays'}`);
    }
    const sortedActual = [...actual].sort();
    const sortedExpected = [...expected].sort();
    assertDeepEqual(sortedActual, sortedExpected, message);
}
