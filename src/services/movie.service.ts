import { Movie, DbData } from "../models/db.types";
import { StatusCodes } from "http-status-codes";
import { IDbProxy } from "../utils/db-proxy";

export interface IMovieService {
  getGenres(): string[];
  createMovie(movie: Movie): MovieCreationResult;
  getMovies(duration?: number, genres?: string[]): Movie[];
}

export class MovieCreationResult {
  constructor(
    readonly status: number,
    readonly message: { id?: number; error?: string; message?: string },
  ) {}
}

export class MovieService implements IMovieService {
  constructor(private readonly dbProxy: IDbProxy) {}

  getGenres(): string[] {
    return this.dbProxy.read()?.genres || [];
  }

  createMovie(movie: Movie): MovieCreationResult {
    const dbdata: DbData = this.dbProxy.read();
    if (!dbdata.movies) dbdata.movies = [];
    if (isTitleDuplicated(movie.title, dbdata.movies))
      return new MovieCreationResult(StatusCodes.CONFLICT, {
        error: `Title "${movie.title}" already exists`,
      });

    movie.id = generateNewId(dbdata.movies);
    dbdata.movies.push(movie);
    this.dbProxy.write(dbdata);

    return new MovieCreationResult(StatusCodes.CREATED, {
      id: movie.id,
      message: "Movie created",
    });

    function generateNewId(movies: Movie[]) {
      return movies.reduce((maxId, movie) => Math.max(maxId, movie.id), 0) + 1;
    }
    function isTitleDuplicated(title: string, movies: Movie[]) {
      return movies.find((movie) => movie.title === title);
    }
  }

  getMovies(duration?: number, genres?: string[]): Movie[] {
    const dbdata = this.dbProxy.read();
    if (!dbdata || !dbdata.movies) return [];
    const movies = dbdata.movies.filter(filterByDuration);
    if (!genres) return getListWithRandomElement(movies);
    return filterAndSortByMatchingGenres(movies);

    function filterAndSortByMatchingGenres(movies: Movie[]) {
      return movies
        .map(mapAddingPriority)
        .filter((movie) => movie.priority > 0)
        .sort((a, b) => b.priority - a.priority)
        .map(mapRemovingPriority);
    }

    function mapAddingPriority(movie) {
      movie.priority = movie.genres.filter((genre) =>
        genres.includes(genre),
      ).length;
      return movie;
    }

    function mapRemovingPriority(movie) {
      movie.priority = undefined;
      return movie;
    }

    function filterByDuration(movie) {
      if (!duration) return true;
      return movie.runtime <= duration + 10 && movie.runtime >= duration - 10;
    }

    function getListWithRandomElement(list) {
      if (list.length === 0) return [];
      const randomIndex = Math.floor(Math.random() * list.length);
      return [list[randomIndex]];
    }
  }
}
