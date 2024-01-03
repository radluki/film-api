import { readFileSync, writeFileSync } from 'fs';

export class FileProxy {
  constructor(
    private readonly filename: string) { }

  read(): any {
    return JSON.parse(readFileSync(this.filename).toString());
  }

  write(data: any) {
    writeFileSync(this.filename, JSON.stringify(data));
  }
}