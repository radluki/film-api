import request from 'supertest';
import { url } from './common';
import fs from 'fs';
import { readDbContent, writeDbContent } from './common';
import { dbPath } from './test-data';


it('when db was removed', async () => {
  const dbdata = readDbContent(dbPath);

  fs.rmSync(dbPath);
  const resp = await request(url).get('/movies');
  writeDbContent(dbPath, dbdata);

  expect(resp.statusCode).toBe(500);
  expect(resp.body.message).toEqual('Internal Server Error');
  expect(resp.body.error).toMatch('ENOENT: no such file or directory, open');
});