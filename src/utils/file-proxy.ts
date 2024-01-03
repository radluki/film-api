import { readFileSync, writeFileSync } from 'fs';

export interface IFileProxy {
  read(): any;
  write(data: any);
}

export class FileProxy implements IFileProxy {
  constructor(
    private readonly filename: string) { }

  read(): any {
    return JSON.parse(readFileSync(this.filename).toString());
  }

  write(data: any) {
    writeFileSync(this.filename, JSON.stringify(data));
  }
}