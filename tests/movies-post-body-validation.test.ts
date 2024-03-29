import request from "supertest";
import { readDbContent, url, writeDbContent } from "./common";
import { DbData } from "../src/models/db.types";
import { movie, dbPath } from "./test-data";

let dbContent: DbData;

describe("POST /movies - validation", () => {
  beforeEach(() => {
    dbContent = readDbContent(dbPath);
  });

  afterEach(async () => {
    writeDbContent(dbPath, dbContent);
  });

  it("201 - movie with all optional fields", () => {
    return request(url).post("/movies").send(movie).expect(201);
  });

  it("400 - movie without title", () => {
    const invalidMovie = { ...movie };
    invalidMovie.title = undefined;
    return request(url)
      .post("/movies")
      .send(invalidMovie)
      .expect(400)
      .expect((res) => {
        expect(res.body.errors).toEqual([
          "title is a required string with max length 255",
        ]);
      });
  });

  it("400 - movie with too long title", () => {
    const invalidMovie = { ...movie };
    invalidMovie.title = "a".repeat(256);
    return request(url)
      .post("/movies")
      .send(invalidMovie)
      .expect(400)
      .expect((res) => {
        expect(res.body.errors).toEqual([
          "title is too long, max length is 255, actual length is 256",
        ]);
      });
  });

  it("201 - movie with title of max length", () => {
    const invalidMovie = { ...movie };
    invalidMovie.title = "a".repeat(255);
    return request(url).post("/movies").send(movie).expect(201);
  });

  it("400 - movie with invalid year", () => {
    const invalidMovie: any = { ...movie };
    invalidMovie.year = "invalid year";
    return request(url)
      .post("/movies")
      .send(invalidMovie)
      .expect(400)
      .expect((res) => {
        expect(res.body.errors).toEqual(["numeric year is required"]);
      });
  });

  it("400 - movie without year", () => {
    const invalidMovie = { ...movie };
    invalidMovie.year = undefined;
    return request(url)
      .post("/movies")
      .send(invalidMovie)
      .expect(400)
      .expect((res) => {
        expect(res.body.errors).toEqual(["numeric year is required"]);
      });
  });

  it("400 - movie without runtime", () => {
    const invalidMovie = { ...movie };
    invalidMovie.runtime = undefined;
    return request(url)
      .post("/movies")
      .send(invalidMovie)
      .expect(400)
      .expect((res) => {
        expect(res.body.errors).toEqual(["numeric runtime is required"]);
      });
  });

  it("400 - movie with invalid runtime", () => {
    const invalidMovie: any = { ...movie };
    invalidMovie.runtime = "invalid runtime";
    return request(url)
      .post("/movies")
      .send(invalidMovie)
      .expect(400)
      .expect((res) => {
        expect(res.body.errors).toEqual(["numeric runtime is required"]);
      });
  });

  it("400 - movie without director", () => {
    const invalidMovie = { ...movie };
    invalidMovie.director = undefined;
    return request(url)
      .post("/movies")
      .send(invalidMovie)
      .expect(400)
      .expect((res) => {
        expect(res.body.errors).toEqual([
          "director is a required string with max length 255",
        ]);
      });
  });

  it("400 - movie with too long director", () => {
    const invalidMovie = { ...movie };
    invalidMovie.director = "a".repeat(256);
    return request(url)
      .post("/movies")
      .send(invalidMovie)
      .expect(400)
      .expect((res) => {
        expect(res.body.errors).toEqual([
          "director is too long, max length is 255, actual length is 256",
        ]);
      });
  });

  it("201 - movie with director of max length", () => {
    const invalidMovie = { ...movie };
    invalidMovie.director = "a".repeat(255);
    return request(url).post("/movies").send(movie).expect(201);
  });

  it("400 - movie without genres", () => {
    const invalidMovie = { ...movie };
    invalidMovie.genres = undefined;
    return request(url)
      .post("/movies")
      .send(invalidMovie)
      .expect(400)
      .expect((res) => {
        expect(res.body.errors).toEqual(["genres must be an array"]);
      });
  });

  it("400 - movie with invalid genres", () => {
    const invalidMovie = { ...movie };
    invalidMovie.genres = ["Animation", "xxxYYY", "Comedy"];
    return request(url)
      .post("/movies")
      .send(invalidMovie)
      .expect(400)
      .expect((res) => {
        expect(res.body.errors).toEqual(["Invalid genres: xxxYYY"]);
      });
  });

  it("400 - movie with genres not an array", () => {
    const invalidMovie = { ...movie };
    invalidMovie.genres = <any>"invalid genres";
    return request(url)
      .post("/movies")
      .send(invalidMovie)
      .expect(400)
      .expect((res) => {
        expect(res.body.errors).toEqual(["genres must be an array"]);
      });
  });

  it("400 - movie with actors not a string", () => {
    const invalidMovie = { ...movie };
    invalidMovie.actors = <any>123;
    return request(url)
      .post("/movies")
      .send(invalidMovie)
      .expect(400)
      .expect((res) => {
        expect(res.body.errors).toEqual(["actors is optional string"]);
      });
  });

  it("400 - movie with actors as array", () => {
    const invalidMovie = { ...movie };
    invalidMovie.actors = <any>["Johnny Depp"];
    return request(url)
      .post("/movies")
      .send(invalidMovie)
      .expect(400)
      .expect((res) => {
        expect(res.body.errors).toEqual(["actors is optional string"]);
      });
  });

  it("201 - movie without actors", () => {
    const modifiedMovie = { ...movie };
    modifiedMovie.actors = undefined;
    return request(url).post("/movies").send(modifiedMovie).expect(201);
  });

  it("400 - movie with plot not a string", () => {
    const invalidMovie = { ...movie };
    invalidMovie.plot = <any>123;
    return request(url)
      .post("/movies")
      .send(invalidMovie)
      .expect(400)
      .expect((res) => {
        expect(res.body.errors).toEqual(["plot is optional string"]);
      });
  });

  it("201 - movie without plot", () => {
    const modifiedMovie = { ...movie };
    modifiedMovie.actors = undefined;
    return request(url).post("/movies").send(modifiedMovie).expect(201);
  });

  it("400 - movie with posterUrl as invalid url", () => {
    const invalidMovie = { ...movie };
    invalidMovie.posterUrl = "invalid url";
    return request(url)
      .post("/movies")
      .send(invalidMovie)
      .expect(400)
      .expect((res) => {
        expect(res.body.errors).toEqual(["posterUrl is an optional valid URL"]);
      });
  });

  it("201 - movie without posterUrl", () => {
    const modifiedMovie = { ...movie };
    modifiedMovie.posterUrl = undefined;
    return request(url).post("/movies").send(modifiedMovie).expect(201);
  });

  it("400 - movie with unknown field", () => {
    const invalidMovie = { ...movie };
    (<any>invalidMovie).unknownFiled = "unknown";
    return request(url)
      .post("/movies")
      .send(invalidMovie)
      .expect(400)
      .expect((res) => {
        expect(res.body.errors).toEqual(["Unknown fields: unknownFiled"]);
      });
  });

  it("400 - multiple validations fail", () => {
    const invalidMovie = { ...movie };
    (<any>invalidMovie).trala = "unknown";
    invalidMovie.year = <any>"unknown";
    invalidMovie.genres = ["xxx"];
    return request(url)
      .post("/movies")
      .send(invalidMovie)
      .expect(400)
      .expect((res) => {
        expect(res.body.errors).toEqual([
          "Unknown fields: trala",
          "numeric year is required",
          "Invalid genres: xxx",
        ]);
      });
  });
});
