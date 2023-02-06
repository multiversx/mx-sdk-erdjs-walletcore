import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { ErrWrongMnemonic } from "./errors";
import { UserSecretKey } from "./userKeys";

const MNEMONIC_STRENGTH = 256;
const BIP44_DERIVATION_PREFIX = "m/44'/508'/0'/0'";

export class Mnemonic {
    private readonly text: string;

    private constructor(text: string) {
        this.text = text;
    }

    static generate(): Mnemonic {
        let text = generateMnemonic(MNEMONIC_STRENGTH);
        return new Mnemonic(text);
    }

    static fromString(text: string) {
        text = text.trim();

        Mnemonic.assertTextIsValid(text);
        return new Mnemonic(text);
    }

    public static assertTextIsValid(text: string) {
        let isValid = validateMnemonic(text);

        if (!isValid) {
            throw new ErrWrongMnemonic();
        }
    }

    deriveKey(addressIndex: number = 0, password: string = ""): UserSecretKey {
        let seed = mnemonicToSeedSync(this.text, password);
        let derivationPath = `${BIP44_DERIVATION_PREFIX}/${addressIndex}'`;
        let derivationResult = derivePath(derivationPath, seed.toString("hex"));
        let key = derivationResult.key;
        return new UserSecretKey(key);
    }

    getWords(): string[] {
        return this.text.split(" ");
    }

    toString(): string {
        return this.text;
    }
}
