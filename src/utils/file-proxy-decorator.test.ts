import { IFileProxy } from "./file-proxy";
import { NumericConversionsFileProxyDecorator } from "./file-proxy-decorator";
import { movie } from "../../tests/test-data";

const fileProxyMock = {
  read: jest.fn(),
  write: jest.fn()
}
const sut = new NumericConversionsFileProxyDecorator(<IFileProxy>fileProxyMock);

beforeEach(() => {
  jest.clearAllMocks();
});

it('read when data is null', () => {
  fileProxyMock.read.mockReturnValueOnce(null);
  const data = sut.read();
  expect(data).toEqual({ movies: [], genres: [] })
})

it('read when data has no movies', () => {
  fileProxyMock.read.mockReturnValueOnce({ genres: ['xxx'] });
  const data = sut.read();
  expect(data).toEqual({ movies: [], genres: ['xxx'] })
});

it('read when data has no genres', () => {
  fileProxyMock.read.mockReturnValueOnce({ movies: [movie] });
  const data = sut.read();
  expect(data).toEqual({ movies: [movie], genres: [] })
});

it('read should parse runtime and year to number', () => {
  fileProxyMock.read.mockReturnValueOnce({
    genres: [],
    movies: [{ ...movie, runtime: '100', year: '2000' }],
  });
  const data = sut.read();
  expect(data).toEqual({
    genres: [],
    movies: [{ ...movie, runtime: 100, year: 2000 }],
  })
});

it('write should stringify runtime and year', () => {
  const data = {
    genres: [],
    movies: [{ ...movie, runtime: 100, year: 2000 }],
  };
  sut.write(data);
  expect(fileProxyMock.write).toHaveBeenCalledWith({
    genres: [],
    movies: [{ ...movie, runtime: '100', year: '2000' }],
  })
});

it('write may throw when data is invalid DbData', () => {
  const data: any = {};
  expect(() => sut.write(data)).toThrow('Cannot read properties of undefined');
});