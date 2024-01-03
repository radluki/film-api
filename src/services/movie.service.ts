import { IFileProxy } from "../utils/file-proxy";
import { Movie, DbData } from "../models/db.types";
import { StatusCodes } from 'http-status-codes';
import { CreationFailure, CreationResult, CreationSuccess } from "../utils/creation-result";

export interface IMovieService {
  getGenres(): Promise<string[]>;
  createMovie(movie: Movie): CreationResult;
  getMovies(duration?: number, genres?: string[]): Movie[];
}

export class MovieService implements IMovieService {
  constructor(private readonly fileProxy: IFileProxy) { }

  async getGenres(): Promise<string[]> {
    return this.fileProxy.read().genres;
  }

  createMovie(movie: Movie): CreationResult {
    const dbdata: DbData = this.fileProxy.read();
    if (isTitleDuplicated(movie.title, dbdata.movies))
      return new CreationFailure(StatusCodes.CONFLICT,
        `Title "${movie.title}" already exists`);

    const newMovie = { ...movie, id: generateNewId(dbdata.movies) };
    dbdata.movies.push(newMovie);
    this.fileProxy.write(dbdata);

    return new CreationSuccess(newMovie.id, 'Movie created');

    function generateNewId(movies: Movie[]) {
      return movies.reduce((maxId, movie) => Math.max(maxId, movie.id), 0) + 1;
    }
    function isTitleDuplicated(title: string, movies: Movie[]) {
      return movies.find((movie) => movie.title === title);
    }
  }

  getMovies(duration?: number, genres?: string[]): Movie[] {
    const movies = this.fileProxy.read().movies.filter(filterByDuration);
    if (!genres)
      return getListWithRandomElement(movies);
    return filterAndSortByMatchingGenres(movies);

    function filterAndSortByMatchingGenres(movies: Movie[]) {
      return movies.map(mapAddingPriority)
        .filter((movie) => movie.priority > 0)
        .sort((a, b) => b.priority - a.priority)
        .map(mapRemovingPriority);
    }

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

    function getListWithRandomElement(list) {
      if (list.length === 0) return [];
      const randomIndex = Math.floor(Math.random() * list.length);
      return [list[randomIndex]];
    }
  }
}