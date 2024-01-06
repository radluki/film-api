import express from "express";
import { IMovieService } from "../services/movie.service";
import { createMoviesGetController } from "./movies-get.controller";
import request from "supertest";

const movieServiceMock = {
  getMovies: jest.fn(),
};
const serviceResult = ["xd"];

const app = express();
app.get(
  "/",
  createMoviesGetController(movieServiceMock as unknown as IMovieService),
);

beforeEach(() => {
  jest.clearAllMocks();
  movieServiceMock.getMovies.mockReturnValue(serviceResult);
});

it("should forward undefined to the service", () => {
  return request(app)
    .get("/")
    .expect(200)
    .expect(serviceResult)
    .expect(() => {
      expect(movieServiceMock.getMovies).toHaveBeenCalledTimes(1);
      expect(movieServiceMock.getMovies).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
    });
});

it("should forward duration to the service", () => {
  return request(app)
    .get("/")
    .query({ duration: 10 })
    .expect(200)
    .expect(serviceResult)
    .expect(() => {
      expect(movieServiceMock.getMovies).toHaveBeenCalledTimes(1);
      expect(movieServiceMock.getMovies).toHaveBeenCalledWith(10, undefined);
    });
});

it("should forward genres to the service", () => {
  return request(app)
    .get("/")
    .query({ genres: ["a", "b"] })
    .expect(200)
    .expect(serviceResult)
    .expect(() => {
      expect(movieServiceMock.getMovies).toHaveBeenCalledTimes(1);
      expect(movieServiceMock.getMovies).toHaveBeenCalledWith(undefined, [
        "a",
        "b",
      ]);
    });
});

it("should forward single genre to the service", () => {
  return request(app)
    .get("/")
    .query({ genres: "a" })
    .expect(200)
    .expect(serviceResult)
    .expect(() => {
      expect(movieServiceMock.getMovies).toHaveBeenCalledTimes(1);
      expect(movieServiceMock.getMovies).toHaveBeenCalledWith(undefined, ["a"]);
    });
});

it("should forward duration and genres to the service", () => {
  return request(app)
    .get("/")
    .query({ genres: ["a"], duration: 33 })
    .expect(200)
    .expect(serviceResult)
    .expect(() => {
      expect(movieServiceMock.getMovies).toHaveBeenCalledTimes(1);
      expect(movieServiceMock.getMovies).toHaveBeenCalledWith(33, ["a"]);
    });
});

it("should forward exception from service to error handler", () => {
  movieServiceMock.getMovies.mockReset();
  movieServiceMock.getMovies.mockImplementation(() => {
    throw new Error("XXXyyy");
  });
  return request(app)
    .get("/")
    .expect(500)
    .expect((res) => {
      expect(res.text).toMatch("XXXyyy");
      expect(movieServiceMock.getMovies).toHaveBeenCalledTimes(1);
    });
});
