import { DbData } from "../models/db.types";
import { IFileProxy } from "./file-proxy";

export interface IDbProxy {
  read(): DbData;
  write(data: DbData);
}

export class NumericConversionsFileProxyDecorator implements IDbProxy {
  constructor(
    private readonly fileProxy: IFileProxy) { }

  read(): DbData {
    const data = this.fileProxy.read();
    if (!data) return { movies: [], genres: [] };
    if (!data.movies) data.movies = [];
    if (!data.genres) data.genres = [];
    data.movies.forEach((movie) => {
      movie.year = parseInt(movie.year);
      movie.runtime = parseInt(movie.runtime);
    });
    return data;
  }

  write(data: DbData) {
    data.movies.forEach((movie: any) => {
      movie.year = movie.year.toString();
      movie.runtime = movie.runtime.toString();
    });
    this.fileProxy.write(data);
  }
}