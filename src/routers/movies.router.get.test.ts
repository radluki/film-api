import express from "express";
import { createMoviesRouter } from "./movies.router";
import { IMovieService } from "../services/movie.service";
import request from "supertest";
import { validateMoviesGetQuery } from "../middleware/movies-get-query.validation";
import { createMoviesGetController } from "../controllers/movies-get.controller";

jest.mock("../config", () => ({
  GENRES: [],
  DBPATH: "dbpath",
}));
jest.mock("../middleware/movies-get-query.validation", () => ({
  validateMoviesGetQuery: jest.fn(),
}));
jest.mock("../controllers/movies-get.controller", () => ({
  createMoviesGetController: jest.fn(),
}));

let shouldControllerThrow = false;
const fakeControllerResponse = { message: "fake controller response" };

(createMoviesGetController as any).mockImplementation(() => (req, res) => {
  if (shouldControllerThrow) throw new Error("XXX");
  res.send(fakeControllerResponse);
});

const movieServiceFake: any = {};
const app = express();
app.use("/", createMoviesRouter(<IMovieService>movieServiceFake));

const validationResponse = { errors: ["validation failed"] };
let failValidationOnGetQuery = false;
const validateMoviesGetQueryMock =
  validateMoviesGetQuery as unknown as jest.Mock;
validateMoviesGetQueryMock.mockImplementation((req, res, next) => {
  if (req.query.genres && !Array.isArray(req.query.genres))
    req.query.genres = [req.query.genres];
  if (!failValidationOnGetQuery) return next();
  res.status(400).json(validationResponse);
});

beforeEach(() => {
  jest.clearAllMocks();
  failValidationOnGetQuery = false;
  shouldControllerThrow = false;
});

describe("movies router GET /", () => {
  it("should not call the controller when validation fails", () => {
    failValidationOnGetQuery = true;
    return request(app)
      .get("/")
      .expect(400)
      .expect(validationResponse)
      .expect(() => {
        expect(validateMoviesGetQueryMock).toHaveBeenCalled();
      });
  });

  it("should respond with fakeControllerResponse when validation passes", () => {
    return request(app)
      .get("/")
      .expect(200)
      .expect(fakeControllerResponse)
      .expect(() => {
        expect(validateMoviesGetQueryMock).toHaveBeenCalled();
      });
  });

  it("get / should return 500 when the controller throws", () => {
    shouldControllerThrow = true;
    return request(app)
      .get("/")
      .expect(500)
      .expect({
        error: "XXX",
        message: "Internal Server Error",
      })
      .expect(() => {
        expect(validateMoviesGetQueryMock).toHaveBeenCalled();
      });
  });
});
