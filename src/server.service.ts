import { FileProxy } from "./file-proxy";

export class ServerService {
  constructor(private readonly fileProxy: FileProxy) { }

  async getGenres(): Promise<string[]> {
    return await this.fileProxy.read().then((data) => data.genres);
  }

  async getMovies(duration?: number, genres?: string[]): Promise<any[]> {
    const dbdata = await this.fileProxy.read().then((data) => data.movies);
    if (!duration && !genres)
      return [chooseRandomElement(dbdata)];
    const durationFiltered = dbdata.filter(filterByDuration);
    if (!genres) return [chooseRandomElement(durationFiltered)];
    return durationFiltered.map(mapAddingPriority)
      .filter((movie) => movie.priority > 0)
      .sort((a, b) => b.priority - a.priority)
      .map(mapRemovingPriority);

    function mapAddingPriority(movie) {
      movie.priority = movie.genres.filter((genre) => genres.includes(genre)).length;
      return movie;
    }

    function mapRemovingPriority(movie) {
      movie.priority = undefined;
      return movie;
    }

    function filterByDuration(movie) {
      if (!duration)
        return true;
      return movie.runtime <= duration + 10 && movie.runtime >= duration - 10;
    }

    function chooseRandomElement(list) {
      const randomIndex = Math.floor(Math.random() * list.length);
      return list[randomIndex];
    }
  }
}