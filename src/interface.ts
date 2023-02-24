export interface IAddress {
    hex(): string;
    bech32(): string;
    pubkey(): Buffer;
}

export interface ISignature {
    hex(): string;
}

/**
 * An interface that defines a signing-capable object.
 */
export interface ISigner {
    /**
     * Gets the {@link Address} of the signer.
     */
    getAddress(): IAddress;

    /**
     * Signs a message (e.g. a transaction).
     */
    sign(signable: ISignable): Promise<void>;
}

/**
 * An interface that defines a signable object (e.g. a transaction).
 */
export interface ISignable {
    /**
     * Returns the signable object in its raw form - a sequence of bytes to be signed.
     */
    serializeForSigning(signedBy: IAddress): Buffer;

    /**
     * Applies the computed signature on the object itself.
     *
     * @param signature The computed signature
     * @param signedBy The address of the {@link ISignature}
     */
    applySignature(signature: ISignature, signedBy: IAddress): void;
}
