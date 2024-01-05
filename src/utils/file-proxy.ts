import { readFileSync, writeFileSync } from "fs";

export interface IFileProxy {
  read(): unknown;
  write(data: unknown): void;
}

export function readJsonFileSync(filename: string): unknown {
  return JSON.parse(readFileSync(filename, "utf-8"));
}

export function writeJsonFileSync(filename: string, data: unknown): void {
  writeFileSync(filename, JSON.stringify(data));
}

export class FileProxy implements IFileProxy {
  constructor(private readonly filename: string) {}

  read(): unknown {
    return readJsonFileSync(this.filename);
  }

  write(data: unknown) {
    writeJsonFileSync(this.filename, data);
  }
}
