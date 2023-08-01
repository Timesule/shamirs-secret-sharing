/// <reference types="node" />
export declare class ShamirsSecretSharing {
    private static stdPrime;
    private static FOUR_BYTES;
    private static HEX_BASE;
    private static BYTE_LENGTH;
    static splitString(secret: string, totalShards: number, threshold: number): string[];
    static combineString(shards: string[]): string;
    static splitBuffer(secretBuffer: Buffer, totalShards: number, threshold: number): string[];
    static combineBuffer(shards: string[]): Buffer;
    private static splitFrag;
    private static combineFrag;
    private static rndInt;
    private static gcd;
    private static modInv;
}
export declare const SSS: typeof ShamirsSecretSharing;
