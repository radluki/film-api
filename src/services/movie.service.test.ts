import { MovieService } from "./movie.service"
import { movie } from "../../tests/test-data";
import { IFileProxy } from "../utils/file-proxy";

const fileProxyMock = {
  read: jest.fn(),
  write: jest.fn()
}

const sut = new MovieService(<IFileProxy>fileProxyMock);

beforeEach(() => {
  jest.clearAllMocks();
});

it('getMovies when movies are undefined', () => {
  fileProxyMock.read.mockReturnValueOnce({});
  const movies = sut.getMovies();
  expect(movies).toEqual([])
})

it('getMovies when file read returns null', () => {
  fileProxyMock.read.mockReturnValueOnce(null);
  const movies = sut.getMovies();
  expect(movies).toEqual([])
})

it('getMovies when arguments not specified', () => {
  jest.spyOn(Math, 'random').mockReturnValue(0.5);
  fileProxyMock.read.mockReturnValueOnce({
    movies: [{ ...movie, id: 2 }, movie, { ...movie, id: 3 }]
  });
  const movies = sut.getMovies();
  expect(movies).toEqual([movie])
})

it('getMovies when duration set', () => {
  jest.spyOn(Math, 'random').mockReturnValue(0.9999999);
  const movie1 = { ...movie, id: 1, runtime: 100 };
  const movie2 = { ...movie, id: 2, runtime: 100 };
  const movie3 = { ...movie, id: 3, runtime: 200 };
  const movie4 = { ...movie, id: 4, runtime: 200 };
  fileProxyMock.read.mockReturnValueOnce({
    movies: [movie1, movie3, movie2, movie4]
  });
  const movies = sut.getMovies(100);
  expect(movies).toEqual([movie2])
})

it('getMovies when genres set', () => {
  const movie1 = { ...movie, id: 1, genres: ['Action', 'Comedy'] };
  const movie2 = { ...movie, id: 2, genres: ['Thriller', 'Comedy'] };
  const movie3 = { ...movie, id: 3, genres: ['Action', 'Drama'] };
  const movie4 = { ...movie, id: 4, genres: ['Animation', 'Crime'] };
  const movie5 = { ...movie, id: 5, genres: ['Drama', 'Crime'] };
  fileProxyMock.read.mockReturnValueOnce({
    movies: [movie5, movie3, movie1, movie2, movie4]
  });
  const movies = sut.getMovies(undefined, ['Action', 'Comedy']);
  expect(movies).toEqual([movie1, movie3, movie2])
})

it('getMovies when genres set and duration set', () => {
  const movie1 = { ...movie, id: 1, genres: ['Action', 'Comedy'], runtime: 100 };
  const movie2 = { ...movie, id: 2, genres: ['Thriller', 'Comedy'], runtime: 111 };
  const movie3 = { ...movie, id: 3, genres: ['Action', 'Drama'], runtime: 110 };
  const movie4 = { ...movie, id: 4, genres: ['Animation', 'Crime'], runtime: 100 };
  const movie5 = { ...movie, id: 5, genres: ['Drama', 'Crime'], runtime: 100 };
  const movie6 = { ...movie, id: 6, genres: ['Action', 'Crime'], runtime: 90 };
  const movie7 = { ...movie, id: 7, genres: ['Action', 'Crime'], runtime: 89 };
  fileProxyMock.read.mockReturnValueOnce({
    movies: [movie5, movie3, movie1, movie2, movie4, movie6, movie7]
  });
  const movies = sut.getMovies(100, ['Action', 'Comedy']);
  expect(movies).toEqual([movie1, movie3, movie6])
})