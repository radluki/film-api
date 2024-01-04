import { DbData } from "../models/db.types";
import { IFileProxy } from "./file-proxy";
import { validateDbData } from "./db-validation";

export interface IDbProxy {
  read(): DbData;
  write(data: DbData): void;
}

export class DbProxyValidatingAdapter implements IDbProxy {
  constructor(private readonly fileProxy: IFileProxy) {}

  read(): DbData {
    const rawData = this.fileProxy.read();
    return validateDbData(rawData);
  }

  write(data: DbData) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.movies.forEach((movie: any) => {
      movie.year = movie.year.toString();
      movie.runtime = movie.runtime.toString();
    });
    this.fileProxy.write(data);
  }
}
