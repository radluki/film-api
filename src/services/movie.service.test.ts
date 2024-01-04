import { MovieService } from "./movie.service";
import { movie } from "../../tests/test-data";
import { IDbProxy } from "../utils/file-proxy-decorator";
import { MovieCreationResult } from "./movie.service";

const dbProxyMock = {
  read: jest.fn(),
  write: jest.fn(),
};

const sut = new MovieService(<IDbProxy>dbProxyMock);

beforeEach(() => {
  jest.clearAllMocks();
});

it("getMovies when movies are undefined", () => {
  dbProxyMock.read.mockReturnValueOnce({});
  const movies = sut.getMovies();
  expect(movies).toEqual([]);
});

it("getMovies when db read returns null", () => {
  dbProxyMock.read.mockReturnValueOnce(null);
  const movies = sut.getMovies();
  expect(movies).toEqual([]);
});

it("getMovies when arguments not specified", () => {
  jest.spyOn(Math, "random").mockReturnValue(0.5);
  dbProxyMock.read.mockReturnValueOnce({
    movies: [{ ...movie, id: 2 }, movie, { ...movie, id: 3 }],
  });
  const movies = sut.getMovies();
  expect(movies).toEqual([movie]);
});

it("getMovies when duration set", () => {
  jest.spyOn(Math, "random").mockReturnValue(0.9999999);
  const movie1 = { ...movie, id: 1, runtime: 100 };
  const movie2 = { ...movie, id: 2, runtime: 100 };
  const movie3 = { ...movie, id: 3, runtime: 200 };
  const movie4 = { ...movie, id: 4, runtime: 200 };
  dbProxyMock.read.mockReturnValueOnce({
    movies: [movie1, movie3, movie2, movie4],
  });
  const movies = sut.getMovies(100);
  expect(movies).toEqual([movie2]);
});

it("getMovies when genres set", () => {
  const movie1 = { ...movie, id: 1, genres: ["Action", "Comedy"] };
  const movie2 = { ...movie, id: 2, genres: ["Thriller", "Comedy"] };
  const movie3 = { ...movie, id: 3, genres: ["Action", "Drama"] };
  const movie4 = { ...movie, id: 4, genres: ["Animation", "Crime"] };
  const movie5 = { ...movie, id: 5, genres: ["Drama", "Crime"] };
  dbProxyMock.read.mockReturnValueOnce({
    movies: [movie5, movie3, movie1, movie2, movie4],
  });
  const movies = sut.getMovies(undefined, ["Action", "Comedy"]);
  expect(movies).toEqual([movie1, movie3, movie2]);
});

it("getMovies when genres set and duration set", () => {
  const movie1 = {
    ...movie,
    id: 1,
    genres: ["Action", "Comedy"],
    runtime: 100,
  };
  const movie2 = {
    ...movie,
    id: 2,
    genres: ["Thriller", "Comedy"],
    runtime: 111,
  };
  const movie3 = { ...movie, id: 3, genres: ["Action", "Drama"], runtime: 110 };
  const movie4 = {
    ...movie,
    id: 4,
    genres: ["Animation", "Crime"],
    runtime: 100,
  };
  const movie5 = { ...movie, id: 5, genres: ["Drama", "Crime"], runtime: 100 };
  const movie6 = { ...movie, id: 6, genres: ["Action", "Crime"], runtime: 90 };
  const movie7 = { ...movie, id: 7, genres: ["Action", "Crime"], runtime: 89 };
  dbProxyMock.read.mockReturnValueOnce({
    movies: [movie5, movie3, movie1, movie2, movie4, movie6, movie7],
  });
  const movies = sut.getMovies(100, ["Action", "Comedy"]);
  expect(movies).toEqual([movie1, movie3, movie6]);
});

it("getGenres no genres", () => {
  dbProxyMock.read.mockReturnValueOnce({});
  const genres = sut.getGenres();
  expect(genres).toEqual([]);
});

it("getGenres when db read returns null", () => {
  dbProxyMock.read.mockReturnValueOnce(null);
  const genres = sut.getGenres();
  expect(genres).toEqual([]);
});

it("getGenres when db read returns an array", () => {
  const genres = ["Action", "Comedy", "Drama"];
  dbProxyMock.read.mockReturnValueOnce({
    genres,
  });
  const result = sut.getGenres();
  expect(result).toEqual(genres);
});

const movieCreatedMessage = "Movie created";
function getTitleAlreadyExistsMessage(title: string) {
  return `Title "${title}" already exists`;
}

it("createMovie when title is duplicated should fail", () => {
  const movie1 = { ...movie, id: 1, title: "title1" };
  const movie2 = { ...movie, id: 2, title: "title2" };
  dbProxyMock.read.mockReturnValueOnce({
    movies: [movie1, movie2],
  });
  const newMovie = { ...movie, title: "title2" };
  const result = sut.createMovie(newMovie);
  expect(result).toEqual(
    new MovieCreationResult(409, {
      error: getTitleAlreadyExistsMessage(newMovie.title),
    }),
  );

  expect(dbProxyMock.write).toHaveBeenCalledTimes(0);
});

it("createMovie when title is unique should succeed", () => {
  const movie1 = { ...movie, id: 1, title: "title1" };
  const movie2 = { ...movie, id: 22, title: "title2" };
  const dbdata = {
    movies: [movie1, movie2],
  };
  const id = 23;
  dbProxyMock.read.mockReturnValueOnce(dbdata);
  const newMovie = { ...movie, title: "title3" };
  const result = sut.createMovie(newMovie);
  expect(result).toEqual(
    new MovieCreationResult(201, { id, message: movieCreatedMessage }),
  );

  expect(dbProxyMock.write).toHaveBeenCalledTimes(1);
  const updatedDbData = {
    movies: [movie1, movie2, { ...newMovie, id }],
  };
  expect(dbProxyMock.write).toHaveBeenCalledWith(updatedDbData);
});

it("createMovie when movies is an empty array", () => {
  const dbdata = {
    movies: [],
  };
  const id = 1;
  dbProxyMock.read.mockReturnValueOnce(dbdata);
  const newMovie = { ...movie, title: "title3" };
  const result = sut.createMovie(newMovie);
  expect(result).toEqual(
    new MovieCreationResult(201, { id, message: movieCreatedMessage }),
  );

  expect(dbProxyMock.write).toHaveBeenCalledTimes(1);
  const updatedDbData = {
    movies: [{ ...newMovie, id }],
  };
  expect(dbProxyMock.write).toHaveBeenCalledWith(updatedDbData);
});

it("createMovie when movies field is null", () => {
  const dbdata = {
    movies: null,
  };
  const id = 1;
  dbProxyMock.read.mockReturnValueOnce(dbdata);
  const newMovie = { ...movie, title: "title3" };
  const result = sut.createMovie(newMovie);
  expect(result).toEqual(
    new MovieCreationResult(201, { id, message: movieCreatedMessage }),
  );

  expect(dbProxyMock.write).toHaveBeenCalledTimes(1);
  const updatedDbData = {
    movies: [{ ...newMovie, id }],
  };
  expect(dbProxyMock.write).toHaveBeenCalledWith(updatedDbData);
});

it("createMovie when movies field is undefined", () => {
  const dbdata = {};
  const id = 1;
  dbProxyMock.read.mockReturnValueOnce(dbdata);
  const newMovie = { ...movie, title: "title3" };
  const result = sut.createMovie(newMovie);
  expect(result).toEqual(
    new MovieCreationResult(201, { id, message: movieCreatedMessage }),
  );

  expect(dbProxyMock.write).toHaveBeenCalledTimes(1);
  const updatedDbData = {
    movies: [{ ...newMovie, id }],
  };
  expect(dbProxyMock.write).toHaveBeenCalledWith(updatedDbData);
});
