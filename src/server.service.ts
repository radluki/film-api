import { FileProxy } from "./file-proxy";
import { Movie, DbData } from "./db.types";
import { StatusCodes } from 'http-status-codes';

export class CreationSuccess {
  id: number;
  message: string;

  constructor(status: number, error: string) {
    this.id = status;
    this.message = error;
  }
}

export class CreationFailure {
  status: number;
  error: string;

  constructor(status: number, error: string) {
    this.status = status;
    this.error = error;
  }
}

type CreationResult = CreationSuccess | CreationFailure;

export class ServerService {
  constructor(private readonly fileProxy: FileProxy) { }

  async getGenres(): Promise<string[]> {
    return await this.fileProxy.read().then((data) => data.genres);
  }

  async createMovie(movie: Movie): Promise<CreationResult> {
    const dbdata: DbData = await this.fileProxy.read();
    if (isTitleDuplicated(movie.title, dbdata.movies))
      return new CreationFailure(StatusCodes.CONFLICT,
        `Title "${movie.title}" already exists`);
    const newMovie = { ...movie, id: generateNewId(dbdata.movies) };
    dbdata.movies.push(newMovie);
    await this.fileProxy.write(dbdata);
    return new CreationSuccess(newMovie.id, 'Movie created');

    function generateNewId(movies: Movie[]) {
      return movies.reduce((maxId, movie) => Math.max(maxId, movie.id), 0) + 1;
    }
    function isTitleDuplicated(title: string, movies: Movie[]) {
      return movies.find((movie) => movie.title === title);
    }
  }

  async getMovies(duration?: number, genres?: string[]): Promise<Movie[]> {
    const movies: Movie[] = await this.fileProxy.read().then((data) => data.movies);
    if (!duration && !genres)
      return [chooseRandomElement(movies)];
    const durationFiltered = movies.filter(filterByDuration);
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