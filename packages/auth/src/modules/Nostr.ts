import { Info } from 'nostr-login-components/dist/types/types';

interface Signer {
  signEvent: (event: any) => Promise<any>;
  encrypt: (pubkey: string, plaintext: string) => Promise<string>;
  decrypt: (pubkey: string, ciphertext: string) => Promise<string>;
}

export interface NostrObjectParams {
  waitReady(): Promise<void>;
  getUserInfo(): Info | null;
  launch(): Promise<void>;
  getSigner(): Signer;
  wait<T>(cb: () => Promise<T>): Promise<T>;
}

class Nostr {

  #params: NostrObjectParams;
  private nip04: {
    encrypt: (pubkey: string, plaintext: string) => Promise<any>;
    decrypt: (pubkey: string, ciphertext: string) => Promise<any>;
  };

  constructor(params: NostrObjectParams) {
    this.#params = params;

    this.getPublicKey = this.getPublicKey.bind(this);
    this.signEvent = this.signEvent.bind(this);
    this.getRelays = this.getRelays.bind(this);
    this.nip04 = {
      encrypt: this.encrypt.bind(this),
      decrypt: this.decrypt.bind(this),
    };
  }

  private async ensureAuth() {
    await this.#params.waitReady();

    // authed?
    if (this.#params.getUserInfo()) return;

    // launch auth flow
    await this.#params.launch();

    // give up
    if (!this.#params.getUserInfo()) {
      throw new Error('Rejected by user');
    }
  }

  async getPublicKey() {
    await this.ensureAuth();
    const userInfo = this.#params.getUserInfo();
    if (userInfo) {
      return userInfo.pubkey;
    } else {
      throw new Error('No user');
    }
  }

  // @ts-ignore
  async signEvent(event) {
    await this.ensureAuth();
    return this.#params.wait(async () => await this.#params.getSigner().signEvent(event));
  }

  async getRelays() {
    // FIXME implement!
    return {};
  }

  async encrypt(pubkey: string, plaintext: string) {
    await this.ensureAuth();
    return this.#params.wait(async () => await this.#params.getSigner().encrypt(pubkey, plaintext));
  }

  async decrypt(pubkey: string, ciphertext: string) {
    await this.ensureAuth();
    return this.#params.wait(async () => await this.#params.getSigner().decrypt(pubkey, ciphertext));
  }
}

export default Nostr;
