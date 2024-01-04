import { readFileSync, writeFileSync } from "fs";

export interface IFileProxy {
  read(): unknown;
  write(data: unknown);
}

export class FileProxy implements IFileProxy {
  constructor(private readonly filename: string) {}

  read(): unknown {
    return JSON.parse(readFileSync(this.filename, "utf-8"));
  }

  write(data: unknown) {
    writeFileSync(this.filename, JSON.stringify(data));
  }
}
