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
    data = validateDbData(data);
    const moviesInDbFormat = data.movies.map(transformMovieForStoringInDb);
    const dataToWrite = { ...data, movies: moviesInDbFormat };
    this.fileProxy.write(dataToWrite);
  }
}

const transformMovieForStoringInDb = (movie) => ({
  ...movie,
  year: movie.year.toString(),
  runtime: movie.runtime.toString(),
});
