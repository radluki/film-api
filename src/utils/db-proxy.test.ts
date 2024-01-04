import { IFileProxy } from "./file-proxy";
import { DbProxyValidatingAdapter } from "./db-proxy";
import { movie as movieWithoutId } from "../../tests/test-data";

const movie = { ...movieWithoutId, id: 1 };
const fileProxyMock = {
  read: jest.fn(),
  write: jest.fn(),
};
const sut = new DbProxyValidatingAdapter(<IFileProxy>fileProxyMock);

beforeEach(() => {
  jest.clearAllMocks();
});

it("read throws when data is null", () => {
  fileProxyMock.read.mockReturnValueOnce(null);
  expect(() => sut.read()).toThrow("JSON db data validation error");
});

it("read throws when no movies", () => {
  fileProxyMock.read.mockReturnValueOnce({ genres: ["xxx"] });
  expect(() => sut.read()).toThrow(
    'JSON db data validation error: "movies" is required',
  );
});

it("read throws when data has no genres", () => {
  fileProxyMock.read.mockReturnValueOnce({ movies: [movie] });
  expect(() => sut.read()).toThrow(
    'JSON db data validation error: "genres" is required',
  );
});

it("read should parse runtime and year to number", () => {
  fileProxyMock.read.mockReturnValueOnce({
    genres: [],
    movies: [{ ...movie, runtime: "100", year: "2000" }],
  });
  const data = sut.read();
  expect(data).toEqual({
    genres: [],
    movies: [{ ...movie, runtime: 100, year: 2000 }],
  });
});

it("read should parse runtime and year even if conversion not needed", () => {
  fileProxyMock.read.mockReturnValueOnce({
    genres: [],
    movies: [{ ...movie, runtime: 100, year: 2000 }],
  });
  const data = sut.read();
  expect(data).toEqual({
    genres: [],
    movies: [{ ...movie, runtime: 100, year: 2000 }],
  });
});

it("write should stringify runtime and year", () => {
  const data = {
    genres: [],
    movies: [{ ...movie, runtime: 100, year: 2000 }],
  };
  sut.write(data);
  expect(fileProxyMock.write).toHaveBeenCalledWith({
    genres: [],
    movies: [{ ...movie, runtime: "100", year: "2000" }],
  });
});

it("write may throw when data is invalid DbData", () => {
  const data: any = {};
  expect(() => sut.write(data)).toThrow("JSON db data validation error");
});

it('write should throw when a movie has no "id"', () => {
  const data = {
    genres: [],
    movies: [movie, { ...movie, id: undefined }],
  };
  expect(() => sut.write(data)).toThrow(
    'JSON db data validation error: "movies[1].id" is required',
  );
});
