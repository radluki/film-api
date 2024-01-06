import express from "express";
import { createMoviesRouter } from "./movies.router";
import { IMovieService } from "../services/movie.service";
import request from "supertest";
import { validateMoviesGetQuery as validate } from "../middleware/movies-get-query.validation";
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
const validateMock = validate as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  shouldControllerThrow = false;
});

describe("movies router GET /", () => {
  it("should not call the controller when validation fails", () => {
    validateMock.mockImplementation((req, res) =>
      res.status(400).json(validationResponse),
    );
    return request(app)
      .get("/")
      .expect(400)
      .expect(validationResponse)
      .expect(() => {
        expect(validateMock).toHaveBeenCalled();
      });
  });

  it("should respond with fakeControllerResponse when validation passes", () => {
    validateMock.mockImplementation((req, res, next) => next());
    return request(app)
      .get("/")
      .expect(200)
      .expect(fakeControllerResponse)
      .expect(() => {
        expect(validateMock).toHaveBeenCalled();
      });
  });

  it("get / should return 500 when the controller throws", () => {
    validateMock.mockImplementation((req, res, next) => next());
    shouldControllerThrow = true;
    return request(app)
      .get("/")
      .expect(500)
      .expect({
        error: "XXX",
        message: "Internal Server Error",
      })
      .expect(() => {
        expect(validateMock).toHaveBeenCalled();
      });
  });

  it("get / should return 500 when the validate throws", () => {
    validateMock.mockImplementation(() => {
      throw new Error("validate throw");
    });
    return request(app)
      .get("/")
      .expect(500)
      .expect({
        error: "validate throw",
        message: "Internal Server Error",
      })
      .expect(() => {
        expect(validateMock).toHaveBeenCalled();
      });
  });
});
