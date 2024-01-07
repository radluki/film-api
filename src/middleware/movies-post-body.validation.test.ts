import express, { json } from "express";
import request from "supertest";
import { Movie } from "../models/db.types";
import { isGenreValid } from "../utils/genres";
import { validateMoviesPostBody } from "./movies-post-body.validation";

const GENRE1 = "genre1";
const GENRE2 = "genre2";
const GENRES = [GENRE1, GENRE2, "genre3", "genre4"];

const movie: Movie = {
  title: "Fake Title",
  year: 1988,
  runtime: 1000,
  genres: [GENRE1, GENRE2],
  director: "Tim Burton",
};

jest.mock("../utils/genres", () => ({
  isGenreValid: jest.fn(),
}));
const isGenreValidMock = isGenreValid as unknown as jest.Mock;

const app = express();
app.use(json());
app.use("/", validateMoviesPostBody, (req, res) => {
  res.send(req.body);
});

beforeEach(() => {
  jest.clearAllMocks();
  isGenreValidMock.mockImplementation((genre) => {
    return GENRES.includes(genre);
  });
});

describe("validateMoviesPostBody", () => {
  const OK = 200;
  const BAD_REQUEST = 400;

  it("should accept valid movie", () => {
    return request(app).post("/").send(movie).expect(OK).expect(movie);
  });

  it("should block movie with an invalid field", () => {
    const invalidMovie = { ...movie, invalidField: "invalid" };
    const errors = ["Unknown fields: invalidField"];
    return request(app)
      .post("/")
      .send(invalidMovie)
      .expect(BAD_REQUEST)
      .expect({ errors });
  });

  it("should block movie without title", () => {
    const invalidMovie = { ...movie, title: undefined };
    const errors = ["title is a required string with max length 255"];
    return request(app)
      .post("/")
      .send(invalidMovie)
      .expect(BAD_REQUEST)
      .expect({ errors });
  });

  it("should block movie without year", () => {
    const invalidMovie = { ...movie, year: undefined };
    const errors = ["numeric year is required"];
    return request(app)
      .post("/")
      .send(invalidMovie)
      .expect(BAD_REQUEST)
      .expect({ errors });
  });

  it("should block movie with nonnumeric year", () => {
    const invalidMovie = { ...movie, year: "xd" };
    const errors = ["numeric year is required"];
    return request(app)
      .post("/")
      .send(invalidMovie)
      .expect(BAD_REQUEST)
      .expect({ errors });
  });

  it("should block movie without runtime", () => {
    const invalidMovie = { ...movie, runtime: undefined };
    const errors = ["numeric runtime is required"];
    return request(app)
      .post("/")
      .send(invalidMovie)
      .expect(BAD_REQUEST)
      .expect({ errors });
  });

  it("should block movie with nonnumeric runtime", () => {
    const invalidMovie = { ...movie, runtime: "xd" };
    const errors = ["numeric runtime is required"];
    return request(app)
      .post("/")
      .send(invalidMovie)
      .expect(BAD_REQUEST)
      .expect({ errors });
  });

  it("should block movie without director", () => {
    const invalidMovie = { ...movie, director: undefined };
    const errors = ["director is a required string with max length 255"];
    return request(app)
      .post("/")
      .send(invalidMovie)
      .expect(BAD_REQUEST)
      .expect({ errors });
  });

  it("should block movie with director as an array", () => {
    const invalidMovie = { ...movie, director: ["d1", "d2"] };
    const errors = ["director is a required string with max length 255"];
    return request(app)
      .post("/")
      .send(invalidMovie)
      .expect(BAD_REQUEST)
      .expect({ errors });
  });

  it("should block movie with actors as an array", () => {
    const invalidMovie = { ...movie, actors: ["d1", "d2"] };
    const errors = ["actors is optional string"];
    return request(app)
      .post("/")
      .send(invalidMovie)
      .expect(BAD_REQUEST)
      .expect({ errors });
  });

  it("should block movie with posterUrl with invalid url", () => {
    const invalidMovie = { ...movie, posterUrl: "invalid url" };
    const errors = ["posterUrl is an optional valid URL"];
    return request(app)
      .post("/")
      .send(invalidMovie)
      .expect(BAD_REQUEST)
      .expect({ errors });
  });

  const validUrl = "https://valid.url";

  it("should accept movie with posterUrl with valid url", () => {
    const validMovie = { ...movie, posterUrl: validUrl };
    return request(app)
      .post("/")
      .send(validMovie)
      .expect(OK)
      .expect(validMovie);
  });

  it("should accept movie with optional fields", () => {
    const validMovie = {
      ...movie,
      plot: "plot",
      actors: "actors",
      posterUrl: validUrl,
    };
    return request(app)
      .post("/")
      .send(validMovie)
      .expect(OK)
      .expect(validMovie);
  });
});
