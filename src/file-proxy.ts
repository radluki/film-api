
export interface IMutex {
  lock(): Promise<() => void>;
  isLocked(): boolean;
}

export class Mutex {
  private unlockPromise: Promise<void>;
  private locked = false;

  constructor(private timeout: number) { }

  async lock(): Promise<() => void> {
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Mutex lock timeout'));
      }, this.timeout);
    });

    await Promise.race([this.unlockPromise, timeoutPromise]);
    this.locked = true;
    let unlock;
    this.unlockPromise = new Promise(
      (resolve) => unlock = () => { resolve(); this.locked = false; }
    );
    return unlock;
  }

  isLocked(): boolean {
    return this.locked;
  }
}

export class FileProxy {
  constructor(private readonly filename: string) { }
}