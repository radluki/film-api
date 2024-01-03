
export class CreationSuccess {
  id: number;
  message: string;

  constructor(status: number, error: string) {
    this.id = status;
    this.message = error;
  }
}

export class CreationFailure {
  status: number;
  error: string;

  constructor(status: number, error: string) {
    this.status = status;
    this.error = error;
  }
}

export type CreationResult = CreationSuccess | CreationFailure;