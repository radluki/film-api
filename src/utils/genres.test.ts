import fs from "fs";
import { loadGenres } from "./config-validation";

jest.mock("./config-validation", () => ({ loadGenres: jest.fn() }));
jest.mock("../config", () => ({ DBPATH: "dbpath-xyz" }));
jest.mock("fs", () => ({ watch: jest.fn() }));
jest.mock("./logger", () => ({ logger: { info: jest.fn() } }));

const loadGenresMock = loadGenres as unknown as jest.Mock;
const watchMock = fs.watch as unknown as jest.Mock;

const dbpath = "dbpath-xyz";
const GENRE1 = "XXXX";
loadGenresMock.mockImplementation(() => [GENRE1]);
import { isGenreValid } from "./genres"; // imported after loadGenresMock set up

jest.useFakeTimers();
describe("genres", () => {
  let watchCallback: (eventType: string, filename: string) => void;
  const timeout = 500;

  beforeEach(() => {
    loadGenresMock.mockClear();
  });

  it("should test isGenreValid after module initialization", () => {
    const invalidGenre = "InvalidGenre";

    expect(isGenreValid(GENRE1)).toBe(true);
    expect(isGenreValid(invalidGenre)).toBe(false);
  });

  it("should set watch on dbpath", () => {
    watchCallback = watchMock.mock.calls[0][1];
    expect(watchMock).toHaveBeenCalledWith(dbpath, expect.any(Function));
  });

  it("should reload genres on dbpath change", () => {
    loadGenresMock.mockReset().mockImplementationOnce(() => ["aaa"]);

    watchCallback("change", dbpath);
    expect(loadGenresMock).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(timeout - 1);
    expect(loadGenresMock).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(timeout);
    expect(loadGenresMock).toHaveBeenCalledTimes(1);
    expect(loadGenresMock).toHaveBeenCalledWith(dbpath);

    expect(isGenreValid(GENRE1)).toBe(false);
    expect(isGenreValid("aaa")).toBe(true);
  });

  it("should reload genres only once on multiple dbpath changes", () => {
    loadGenresMock.mockReset().mockImplementationOnce(() => ["bbb"]);
    watchCallback("change", dbpath);
    watchCallback("change", dbpath);
    watchCallback("change", dbpath);
    expect(loadGenresMock).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(timeout - 1);
    expect(loadGenresMock).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(timeout);
    expect(loadGenresMock).toHaveBeenCalledTimes(1);
    expect(loadGenresMock).toHaveBeenCalledWith(dbpath);

    expect(isGenreValid(GENRE1)).toBe(false);
    expect(isGenreValid("aaa")).toBe(false);
    expect(isGenreValid("bbb")).toBe(true);
  });

  it("should not reload genres without dbpath change", () => {
    loadGenresMock.mockReset().mockImplementationOnce(() => ["ccc"]);
    watchCallback("other-event", dbpath);
    watchCallback("other-event2", dbpath);
    expect(loadGenresMock).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(timeout - 1);
    expect(loadGenresMock).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(timeout);
    expect(loadGenresMock).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(10 * timeout);
    expect(loadGenresMock).toHaveBeenCalledTimes(0);

    expect(isGenreValid("bbb")).toBe(true);
    expect(isGenreValid("ccc")).toBe(false);
  });

  it("should reload genres even if change event is preceded by other event", () => {
    loadGenresMock.mockReset().mockImplementationOnce(() => ["aaa"]);
    watchCallback("other-event", dbpath);
    watchCallback("change", dbpath);
    expect(loadGenresMock).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(timeout - 1);
    expect(loadGenresMock).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(timeout);
    expect(loadGenresMock).toHaveBeenCalledTimes(1);

    expect(isGenreValid("aaa")).toBe(true);
    expect(isGenreValid("bbb")).toBe(false);
  });
});

afterAll(() => {
  jest.useRealTimers();
});
