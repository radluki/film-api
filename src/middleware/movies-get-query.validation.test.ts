import express from "express";
import request from "supertest";
import { validateMoviesGetQuery } from "./movies-get-query.validation";

const GENRE1 = "genre1";
const GENRE2 = "genre2";
const GENRE3 = "genre3";
const GENRE_INVALID = "genre_invalid";

jest.mock("../config", () => ({
  GENRES: ["genre1", "genre2", "genre3", "genre4"],
  DBPATH: "dbpath",
}));

const serviceResult = { message: "ok" };
const app = express();
app.get("/", validateMoviesGetQuery, (req, res) => {
  res.send(serviceResult);
});

describe("movies router GET /", () => {
  it("should respond with service result", () => {
    return request(app).get("/").expect(200).expect(serviceResult);
  });

  it("should call service with query params", () => {
    const query = { duration: 10, genres: ["genre1"] };
    return request(app)
      .get("/")
      .query(query)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(serviceResult);
      });
  });

  it("should call service with duration", () => {
    const query = { duration: 10 };
    return request(app)
      .get("/")
      .query(query)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(serviceResult);
      });
  });

  it("should call service with genres", () => {
    const query = { genres: [GENRE1, GENRE2] };
    return request(app)
      .get("/")
      .query(query)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(serviceResult);
      });
  });

  it("should accept genres as comma separated string", () => {
    return request(app)
      .get(`/?genres=${GENRE1},${GENRE2}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(serviceResult);
      });
  });

  it("should accept genres as repeated genres=...", () => {
    return request(app)
      .get(`/?genres=${GENRE1}&genres=${GENRE2}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(serviceResult);
      });
  });

  it("should accept genres when both formats used in a query", () => {
    return request(app)
      .get(`/?genres=${GENRE1},${GENRE2}&genres=${GENRE3}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(serviceResult);
      });
  });

  it("invalid genre should cause bad request", () => {
    const query = { genres: [GENRE1, GENRE_INVALID, GENRE2] };
    return request(app)
      .get("/")
      .query(query)
      .expect(400)
      .expect((res) => {
        expect(res.body.errors).toEqual([`Invalid genres: ${GENRE_INVALID}`]);
      });
  });

  it("nonnumeric duration should cause bad request", () => {
    const query = { duration: "10x" };
    return request(app)
      .get("/")
      .query(query)
      .expect(400)
      .expect((res) => {
        expect(res.body.errors).toEqual(["duration must be a number"]);
      });
  });
});
