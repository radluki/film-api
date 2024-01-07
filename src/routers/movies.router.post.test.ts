import express from "express";
import { createMoviesRouter } from "./movies.router";
import { IMovieService } from "../services/movie.service";
import request from "supertest";
import { Movie } from "../models/db.types";
import { validateMoviesPostBody as validate } from "../middleware/movies-post-body.validation";
import { createMoviesPostController } from "../controllers/movies-post.controller";

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
jest.mock("../controllers/movies-post.controller", () => ({
  createMoviesPostController: jest.fn(),
}));
(createMoviesPostController as any).mockImplementation(() => controllerMock);

const validateMock = validate as unknown as jest.Mock;
const controllerMock = jest.fn();
const movieServiceMock = {};

const app = express();
app.use("/", createMoviesRouter(movieServiceMock as unknown as IMovieService));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("movies router POST /", () => {
  it("should pass validate and return controller response", () => {
    const msg = { id: 55, message: "fake msg" };
    validateMock.mockImplementation((req, res, next) => next());
    controllerMock.mockImplementation((req, res) => res.status(201).json(msg));
    return request(app)
      .post("/")
      .send(movie)
      .expect(201)
      .expect(msg)
      .expect(() => {
        expect(validateMock).toHaveBeenCalledTimes(1);
      });
  });

  it('should not call controller when "validate" fails', () => {
    const errors = ["validation failed"];
    validateMock.mockImplementation((req, res) =>
      res.status(400).json({ errors }),
    );
    return request(app).post("/").send(movie).expect(400).expect({ errors });
  });

  it("post / should return 500 when validate throws", () => {
    validateMock.mockImplementation(() => {
      throw new Error("validate throw");
    });
    return request(app).post("/").send(movie).expect(500).expect({
      error: "validate throw",
      message: "Internal Server Error",
    });
  });

  it("post / should return 500 when controller throws", () => {
    validateMock.mockImplementation((req, res, next) => next());
    controllerMock.mockImplementation(() => {
      throw new Error("XXXtre");
    });
    return request(app)
      .post("/")
      .send(movie)
      .expect(500)
      .expect({
        error: "XXXtre",
        message: "Internal Server Error",
      })
      .expect(() => {
        expect(validateMock).toHaveBeenCalledTimes(1);
      });
  });
});
