import { FileProxy } from "./file-proxy";

export class ServerService {
  constructor(private readonly fileProxy: FileProxy) { }

  getGenres(): Promise<string[]> {
    return this.fileProxy.read().then((data) => data.genres);
  }

  getMovies(): Promise<any[]> {
    return this.fileProxy.read().then((data) => data.movies);
  }
}