import express from "express";
import { createMoviesRouter } from "./movies.router";
import { IMovieService, MovieCreationResult } from "../services/movie.service";
import request from "supertest";
import { Movie } from "../models/db.types";
import { validateMoviesPostBody as validate } from "../middleware/movies-post-body.validation";

const movieServiceMock = {
  createMovie: jest.fn(),
};

const GENRE1 = "genre1";
const GENRE2 = "genre2";

const movie: Movie = {
  title: "Fake Title",
  year: 1988,
  runtime: 1000,
  genres: [GENRE1, GENRE2],
  director: "Tim Burton",
};

jest.mock("../utils/genres", () => ({}));
jest.mock("../middleware/movies-post-body.validation", () => ({
  validateMoviesPostBody: jest.fn(),
}));
const validateMock = validate as unknown as jest.Mock;

const app = express();
app.use("/", createMoviesRouter(movieServiceMock as unknown as IMovieService));

beforeEach(() => {
  jest.clearAllMocks();
  validateMock.mockImplementation((req, res, next) => next());
});

// TODO split POST tests in similar way it was done for GET
describe("movies router POST /", () => {
  const id = 44;
  const message = "Movie created - fake";
  const msg = { id, message };
  const CREATE = 201;
  const successResult = new MovieCreationResult(CREATE, msg);

  it("should call service with body", () => {
    movieServiceMock.createMovie.mockReturnValueOnce(successResult);
    return request(app)
      .post("/")
      .send(movie)
      .expect(CREATE)
      .expect((res) => {
        expect(res.body).toEqual(msg);
        expect(movieServiceMock.createMovie).toHaveBeenCalledWith(movie);
      });
  });

  it("should forward errors from service", () => {
    const error = "error - fake";
    const msg = { error };
    const status = 409;
    const errorResult = new MovieCreationResult(status, msg);
    movieServiceMock.createMovie.mockReturnValueOnce(errorResult);
    return request(app)
      .post("/")
      .send(movie)
      .expect(status)
      .expect((res) => {
        expect(res.body).toEqual(msg);
        expect(movieServiceMock.createMovie).toHaveBeenCalledWith(movie);
      });
  });

  it('should not call service when "validate" fails', () => {
    validateMock.mockReset();
    const errors = ["validation failed"];
    validateMock.mockImplementation((req, res) =>
      res.status(400).json({ errors }),
    );
    return request(app)
      .post("/")
      .send(movie)
      .expect(400)
      .expect({ errors })
      .expect(() => {
        expect(movieServiceMock.createMovie).not.toHaveBeenCalled();
      });
  });

  it("post / should return 500 when service throws", () => {
    movieServiceMock.createMovie.mockReset();
    movieServiceMock.createMovie.mockImplementation(() => {
      throw new Error("XXX");
    });
    return request(app)
      .post("/")
      .send(movie)
      .expect(500)
      .expect((res) => {
        expect(res.body).toEqual({
          error: "XXX",
          message: "Internal Server Error",
        });
        expect(movieServiceMock.createMovie).toHaveBeenCalledWith(movie);
      });
  });
});
