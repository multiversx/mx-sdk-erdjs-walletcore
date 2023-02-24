import * as tweetnacl from "tweetnacl";
import { guardLength } from "./assertions";
import { IAddress } from "./interface";
import { parseUserKey } from "./pem";
import { UserAddress } from "./userAddress";

export const USER_SEED_LENGTH = 32;
export const USER_PUBKEY_LENGTH = 32;

export class UserSecretKey {
    private readonly buffer: Buffer;

    constructor(buffer: Buffer) {
        guardLength(buffer, USER_SEED_LENGTH);

        this.buffer = buffer;
    }

    static fromString(value: string): UserSecretKey {
        guardLength(value, USER_SEED_LENGTH * 2);

        let buffer = Buffer.from(value, "hex");
        return new UserSecretKey(buffer);
    }

    static fromPem(text: string, index: number = 0): UserSecretKey {
        return parseUserKey(text, index);
    }

    generatePublicKey(): UserPublicKey {
        let keyPair = tweetnacl.sign.keyPair.fromSeed(new Uint8Array(this.buffer));
        let buffer = Buffer.from(keyPair.publicKey);
        return new UserPublicKey(buffer);
    }

    sign(message: Buffer): Buffer {
        let pair = tweetnacl.sign.keyPair.fromSeed(new Uint8Array(this.buffer));
        let signingKey = pair.secretKey;
        let signature = tweetnacl.sign(new Uint8Array(message), signingKey);
        // "tweetnacl.sign()" returns the concatenated [signature, message], therfore we remove the appended message:
        signature = signature.slice(0, signature.length - message.length);

        return Buffer.from(signature);
    }

    hex(): string {
        return this.buffer.toString("hex");
    }

    valueOf(): Buffer {
        return this.buffer;
    }
}

export class UserPublicKey {
    private readonly buffer: Buffer;

    constructor(buffer: Buffer) {
        guardLength(buffer, USER_PUBKEY_LENGTH);

        this.buffer = buffer;
    }

    verify(data: Buffer, signature: Buffer): boolean {
        try {
            const unopenedMessage = Buffer.concat([signature, data]);
            const unsignedMessage = tweetnacl.sign.open(unopenedMessage, this.buffer);
            return unsignedMessage != null;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    hex(): string {
        return this.buffer.toString("hex");
    }

    toAddress(): IAddress {
        return new UserAddress(this.buffer);
    }

    valueOf(): Buffer {
        return this.buffer;
    }
}
