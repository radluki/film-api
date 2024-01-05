import request from "supertest";
import { url } from "./common";
import { readDbContent, writeDbContent } from "./common";
import { dbPath } from "./test-data";
import { movie } from "./test-data";

it("/movies GET should return 500 when db was cleared", async () => {
  const dbdata = readDbContent(dbPath);

  writeDbContent(dbPath, "");
  const resp = await request(url).get("/movies");
  writeDbContent(dbPath, dbdata);

  expect(resp.statusCode).toBe(500);
  expect(resp.body.message).toEqual("Internal Server Error");
  expect(resp.body.error).toMatch("Database validation failed");
});

it("/movies POST should return 500 when db was cleared", async () => {
  const dbdata = readDbContent(dbPath);

  writeDbContent(dbPath, "");
  const resp = await request(url).post("/movies").send(movie);
  writeDbContent(dbPath, dbdata);

  expect(resp.statusCode).toBe(500);
  expect(resp.body.message).toEqual("Internal Server Error");
  expect(resp.body.error).toMatch("Database validation failed");
});
