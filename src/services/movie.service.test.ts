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

it('dumm', () => {
  expect(1).toBe(1)
})