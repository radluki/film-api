import request from 'supertest';
import { readDbContent, url, writeDbContent } from './common';
import { DbData } from '../src/models/db.types';
import { movie, dbPath } from './test-data';

let dbContent: DbData;

describe('POST /movies - logic', () => {
  beforeEach(() => {
    dbContent = readDbContent(dbPath);
  });

  afterEach(async () => {
    writeDbContent(dbPath, dbContent);
  });

  it('should create a movie with POST and retrieve with GET', async () => {
    const postResp = await request(url).post('/movies')
      .send(movie);
    expect(postResp.statusCode).toBe(201);
    expect(postResp.body.id).toBeDefined();
    const id = postResp.body.id;
    expect(id).toBeGreaterThan(0);
    expect(postResp.body.message).toEqual('Movie created');

    const getResp = await request(url).get(`/movies/?duration=1000`);
    expect(getResp.statusCode).toBe(200);
    expect(getResp.body.length).toBe(1);
    expect(getResp.body[0].id).toEqual(id);
    getResp.body[0].id = undefined;
    expect(getResp.body[0]).toEqual(movie);
  });

  it('should create a movie with POST and retrieve directly from db', async () => {
    const postResp = await request(url).post('/movies')
      .send(movie);
    expect(postResp.statusCode).toBe(201);
    expect(postResp.body.id).toBeDefined();
    const id = postResp.body.id;
    expect(id).toBeGreaterThan(0);
    expect(postResp.body.message).toEqual('Movie created');

    const dbdata: DbData = readDbContent(dbPath);
    const addedMovie = dbdata.movies.find((movie) => movie.id === id);
    expect(addedMovie).toBeDefined();
    expect(addedMovie).toEqual({ ...movie, id });
    const idWasInDbBeforeAddition = dbContent.movies.some((movie) => movie.id === id);
    expect(idWasInDbBeforeAddition).toBeFalsy();
  });

  it('should reject an attempt to add the same movie twice', async () => {
    const postResp = await request(url).post('/movies')
      .send(movie);
    expect(postResp.statusCode).toBe(201);
    expect(postResp.body.id).toBeDefined();
    const id = postResp.body.id;
    expect(id).toBeGreaterThan(0);
    expect(postResp.body.message).toEqual('Movie created');

    const postResp2 = await request(url).post('/movies')
      .send(movie);
    expect(postResp2.statusCode).toBe(409);
    expect(postResp2.body.errors).toEqual(['Title "Beetlejuice 2" already exists']);
  });
});
