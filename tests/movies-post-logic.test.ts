import request from 'supertest';
import { readDbContent, url, writeDbContent } from './common';
import { DbData } from '../src/db.types';
import { movie, dbPath } from './test-data';

let dbContent: DbData;

describe('POST /movies - validation', () => {
  beforeEach(() => {
    dbContent = readDbContent(dbPath);
  });

  afterEach(async () => {
    writeDbContent(dbPath, dbContent);
  });

  it('201 - movie with all optional fields', () => {
    return request(url).post('/movies')
      .send(movie)
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toBeDefined();
        expect(res.body.message).toEqual('Movie created');
      });
  });

});
