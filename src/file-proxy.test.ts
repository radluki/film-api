import { FileProxy } from "./file-proxy";
import fs from 'fs/promises';

const dbfile = './data/test-db.json';

const sut = new FileProxy(dbfile);

beforeEach(async () => {
  jest.clearAllMocks();
  await fs.writeFile(dbfile, '');
});

afterEach(async () => {
  await fs.rm(dbfile);
});

it('read on invalid path should throw', async () => {
  const sutInvalidPath = new FileProxy('./invalid/db.json');
  expect(() => sutInvalidPath.read()).toThrow('ENOENT: no such file or directory, open');
});

it('write should save data as json', async () => {
  const initialFileContent = await fs.readFile(dbfile);
  expect(initialFileContent.toString()).toEqual('');

  const data = { data: 'test' };
  sut.write(data);

  const fileContent = await fs.readFile(dbfile);
  expect(JSON.parse(fileContent.toString())).toEqual(data);

  const readData = sut.read();
  expect(readData).toEqual(data);
});
