import express from "express";
import { createMoviesRouter } from "./movies.router";
import { IMovieService } from "../services/movie.service";
import request from "supertest";
import { validateMoviesGetQuery as validate } from "../middleware/movies-get-query.validation";
import { createMoviesGetController } from "../controllers/movies-get.controller";

jest.mock("../utils/genres", () => ({}));
jest.mock("../middleware/movies-get-query.validation", () => ({
  validateMoviesGetQuery: jest.fn(),
}));
jest.mock("../controllers/movies-get.controller", () => ({
  createMoviesGetController: jest.fn(),
}));
(createMoviesGetController as any).mockImplementation(() => controllerMock);

const controllerResponse = { message: "fake controller response" };
const validationResponse = { errors: ["validation failed"] };

const controllerMock = jest.fn();
const validateMock = validate as unknown as jest.Mock;
const movieServiceFake: any = {};

const app = express();
app.use("/", createMoviesRouter(<IMovieService>movieServiceFake));

beforeEach(() => {
  jest.clearAllMocks();
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

  it("should respond with controllerResponse when validation passes", () => {
    validateMock.mockImplementation((req, res, next) => next());
    controllerMock.mockImplementation((req, res) =>
      res.json(controllerResponse),
    );
    return request(app)
      .get("/")
      .expect(200)
      .expect(controllerResponse)
      .expect(() => {
        expect(validateMock).toHaveBeenCalled();
      });
  });

  it("get / should return 500 when the controller throws", () => {
    validateMock.mockImplementation((req, res, next) => next());
    controllerMock.mockImplementation(() => {
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
