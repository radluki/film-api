import { DbData } from "../models/db.types";
import { IFileProxy } from "./file-proxy";

export interface IDbProxy {
  read(): DbData;
  write(data: DbData): void;
}

export class NumericConversionsFileProxyDecorator implements IDbProxy {
  constructor(private readonly fileProxy: IFileProxy) {}

  read(): DbData {
    const data = this.fileProxy.read() as DbData;
    if (!data) return { movies: [], genres: [] };
    if (!data.movies) data.movies = [];
    if (!data.genres) data.genres = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.movies.forEach((movie: any) => {
      movie.year = parseInt(movie.year);
      movie.runtime = parseInt(movie.runtime);
    });
    return data;
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
