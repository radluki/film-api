import express from "express";
import { createMoviesRouter } from "./movies.router";
import { IMovieService, MovieCreationResult } from "../services/movie.service";
import request from "supertest";
import { Movie } from "../models/db.types";
import { validateMoviesGetQuery } from "../middleware/movies-get-query.validation";

const movieServiceMock = {
  getMovies: jest.fn(),
  createMovie: jest.fn(),
  getGenres: jest.fn(),
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

jest.mock("../config", () => ({
  GENRES: ["genre1", "genre2", "genre3", "genre4"],
  DBPATH: "dbpath",
}));
jest.mock("../middleware/movies-get-query.validation", () => ({
  validateMoviesGetQuery: jest.fn(),
}));

const app = express();
app.use("/", createMoviesRouter(<IMovieService>movieServiceMock));

const serviceResult = ["xd"];
const validationResponse = { errors: ["validation failed"] };
let failValidationOnGetQuery = false;
const validateMoviesGetQueryMock =
  validateMoviesGetQuery as unknown as jest.Mock;
setUpValidateMoviesGetQueryFake();

function setUpValidateMoviesGetQueryFake() {
  const failValidationOnGetQueryFake = (req, res, next) => {
    if (req.query.genres && !Array.isArray(req.query.genres))
      req.query.genres = [req.query.genres];
    if (!failValidationOnGetQuery) return next();
    res.status(400).json(validationResponse);
  };

  validateMoviesGetQueryMock.mockImplementation(failValidationOnGetQueryFake);
}

beforeEach(() => {
  jest.clearAllMocks();
  movieServiceMock.getMovies.mockReturnValueOnce(serviceResult);
  failValidationOnGetQuery = false;
});

describe("movies router GET /", () => {
  it("should not call the service when validation fails", () => {
    failValidationOnGetQuery = true;
    return request(app)
      .get("/")
      .expect(400)
      .expect(validationResponse)
      .expect(() => {
        expect(validateMoviesGetQueryMock).toHaveBeenCalled();
        expect(movieServiceMock.getMovies).toHaveBeenCalledTimes(0);
      });
  });

  it("should respond with service result when validation passes", () => {
    failValidationOnGetQuery = false;
    return request(app)
      .get("/")
      .expect(200)
      .expect(serviceResult)
      .expect(() => {
        expect(validateMoviesGetQueryMock).toHaveBeenCalled();
        expect(movieServiceMock.getMovies).toHaveBeenCalledTimes(1);
      });
  });

  it("should call service with query params", () => {
    const query = { duration: 10, genres: ["genre1"] };
    return request(app)
      .get("/")
      .query(query)
      .expect(200)
      .expect(serviceResult)
      .expect(() => {
        expect(movieServiceMock.getMovies).toHaveBeenCalledWith(
          query.duration,
          query.genres,
        );
        expect(validateMoviesGetQueryMock).toHaveBeenCalled();
      });
  });

  it("should call service with duration", () => {
    const query = { duration: 10 };
    return request(app)
      .get("/")
      .query(query)
      .expect(200)
      .expect(serviceResult)
      .expect(() => {
        expect(movieServiceMock.getMovies).toHaveBeenCalledWith(
          query.duration,
          undefined,
        );
        expect(validateMoviesGetQueryMock).toHaveBeenCalled();
      });
  });

  it("should call service with genres", () => {
    const query = { genres: [GENRE1, GENRE2] };
    return request(app)
      .get("/")
      .query(query)
      .expect(200)
      .expect(serviceResult)
      .expect(() => {
        expect(movieServiceMock.getMovies).toHaveBeenCalledWith(
          NaN,
          query.genres,
        );
        expect(validateMoviesGetQueryMock).toHaveBeenCalled();
      });
  });

  it("get / should return 500 when service throws", () => {
    movieServiceMock.getMovies.mockReset();
    movieServiceMock.getMovies.mockImplementation(() => {
      throw new Error("XXX");
    });
    return request(app)
      .get("/")
      .expect(500)
      .expect({
        error: "XXX",
        message: "Internal Server Error",
      })
      .expect(() => {
        expect(movieServiceMock.getMovies).toHaveBeenCalledWith(NaN, undefined);
        expect(validateMoviesGetQueryMock).toHaveBeenCalled();
      });
  });
});

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

  it("should block movie with an invalid field", () => {
    const invalidMovie = { ...movie, invalidField: "invalid" };
    const errors = ["Unknown fields: invalidField"];
    return request(app)
      .post("/")
      .send(invalidMovie)
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual({ errors });
        expect(movieServiceMock.createMovie).not.toHaveBeenCalled();
      });
  });

  it("should block movie without title", () => {
    const invalidMovie = { ...movie, title: undefined };
    const errors = ["title is a required string with max length 255"];
    return request(app)
      .post("/")
      .send(invalidMovie)
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual({ errors });
        expect(movieServiceMock.createMovie).not.toHaveBeenCalled();
      });
  });

  it("should block movie without year", () => {
    const invalidMovie = { ...movie, year: undefined };
    const errors = ["numeric year is required"];
    return request(app)
      .post("/")
      .send(invalidMovie)
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual({ errors });
        expect(movieServiceMock.createMovie).not.toHaveBeenCalled();
      });
  });

  it("should block movie with nonnumeric year", () => {
    const invalidMovie = { ...movie, year: "xd" };
    const errors = ["numeric year is required"];
    return request(app)
      .post("/")
      .send(invalidMovie)
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual({ errors });
        expect(movieServiceMock.createMovie).not.toHaveBeenCalled();
      });
  });

  it("should block movie without runtime", () => {
    const invalidMovie = { ...movie, runtime: undefined };
    const errors = ["numeric runtime is required"];
    return request(app)
      .post("/")
      .send(invalidMovie)
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual({ errors });
        expect(movieServiceMock.createMovie).not.toHaveBeenCalled();
      });
  });

  it("should block movie with nonnumeric runtime", () => {
    const invalidMovie = { ...movie, runtime: "xd" };
    const errors = ["numeric runtime is required"];
    return request(app)
      .post("/")
      .send(invalidMovie)
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual({ errors });
        expect(movieServiceMock.createMovie).not.toHaveBeenCalled();
      });
  });

  it("should block movie without director", () => {
    const invalidMovie = { ...movie, director: undefined };
    const errors = ["director is a required string with max length 255"];
    return request(app)
      .post("/")
      .send(invalidMovie)
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual({ errors });
        expect(movieServiceMock.createMovie).not.toHaveBeenCalled();
      });
  });

  it("should block movie with director as an array", () => {
    const invalidMovie = { ...movie, director: ["d1", "d2"] };
    const errors = ["director is a required string with max length 255"];
    return request(app)
      .post("/")
      .send(invalidMovie)
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual({ errors });
        expect(movieServiceMock.createMovie).not.toHaveBeenCalled();
      });
  });

  it("should block movie with actors as an array", () => {
    const invalidMovie = { ...movie, actors: ["d1", "d2"] };
    const errors = ["actors is optional string"];
    return request(app)
      .post("/")
      .send(invalidMovie)
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual({ errors });
        expect(movieServiceMock.createMovie).not.toHaveBeenCalled();
      });
  });

  it("should block movie with posterUrl with invalid url", () => {
    const invalidMovie = { ...movie, posterUrl: "invalid url" };
    const errors = ["posterUrl is an optional valid URL"];
    return request(app)
      .post("/")
      .send(invalidMovie)
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual({ errors });
        expect(movieServiceMock.createMovie).not.toHaveBeenCalled();
      });
  });

  const validUrl = "https://valid.url";

  it("should accept movie with posterUrl with valid url", () => {
    const validMovie = { ...movie, posterUrl: validUrl };
    movieServiceMock.createMovie.mockReturnValueOnce(successResult);
    return request(app)
      .post("/")
      .send(validMovie)
      .expect(CREATE)
      .expect((res) => {
        expect(res.body).toEqual(msg);
        expect(movieServiceMock.createMovie).toHaveBeenCalledWith(validMovie);
      });
  });

  it("should accept movie with optional fields", () => {
    const validMovie = {
      ...movie,
      plot: "plot",
      actors: "actors",
      posterUrl: validUrl,
    };
    movieServiceMock.createMovie.mockReturnValueOnce(successResult);
    return request(app)
      .post("/")
      .send(validMovie)
      .expect(CREATE)
      .expect((res) => {
        expect(res.body).toEqual(msg);
        expect(movieServiceMock.createMovie).toHaveBeenCalledWith(validMovie);
      });
  });

  it("post / should return 500 when service throws", () => {
    jest.resetAllMocks();
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
