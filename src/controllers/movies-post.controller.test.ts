import express, { json } from "express";
import { IMovieService, MovieCreationResult } from "../services/movie.service";
import request from "supertest";
import { createMoviesPostController } from "./movies-post.controller";

const movieServiceMock = {
  createMovie: jest.fn(),
};

const body = { content: "fake body" };

const app = express();
app.use(json());
app.post(
  "/",
  createMoviesPostController(movieServiceMock as unknown as IMovieService),
);

beforeEach(() => {
  jest.clearAllMocks();
});

it("should forward body to the service and respond with success", () => {
  const successMessage = { id: 11, message: "fake msg", fakeField: true };
  const successResult = new MovieCreationResult(201, successMessage);
  movieServiceMock.createMovie.mockReturnValue(successResult);
  return request(app)
    .post("/")
    .send(body)
    .expect(201)
    .expect(successMessage)
    .expect(() => {
      expect(movieServiceMock.createMovie).toHaveBeenCalledTimes(1);
      expect(movieServiceMock.createMovie).toHaveBeenCalledWith(body);
    });
});

it("should forward body to the service and respond with failure", () => {
  const failMessage = { error: "fake msg", fakeField: true };
  const failureResult = new MovieCreationResult(409, failMessage);
  movieServiceMock.createMovie.mockReturnValue(failureResult);
  return request(app)
    .post("/")
    .send(body)
    .expect(409)
    .expect(failMessage)
    .expect(() => {
      expect(movieServiceMock.createMovie).toHaveBeenCalledTimes(1);
      expect(movieServiceMock.createMovie).toHaveBeenCalledWith(body);
    });
});

it("should forward exception from service to error handler", () => {
  movieServiceMock.createMovie.mockImplementation(() => {
    throw new Error("XXXyyy");
  });
  return request(app)
    .post("/")
    .send(body)
    .expect(500)
    .expect((res) => {
      expect(res.text).toMatch("XXXyyy");
      expect(movieServiceMock.createMovie).toHaveBeenCalledTimes(1);
      expect(movieServiceMock.createMovie).toHaveBeenCalledWith(body);
    });
});
