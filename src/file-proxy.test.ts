import { FileProxy } from "./file-proxy";
import fs from 'fs/promises';

const readOnlyTestFile = './data/test-db.json';
const readWriteTestFile = './data/test-db-write.json';

const sut = new FileProxy(readOnlyTestFile);
const sutWrite = new FileProxy(readWriteTestFile);

beforeEach(async () => {
  jest.clearAllMocks();
  await fs.writeFile(readWriteTestFile, '');
});

it('read on invalid path should throw', async () => {
  const sutInvalidPath = new FileProxy('./invalid/db.json');
  expect(() => sutInvalidPath.read()).toThrow('ENOENT: no such file or directory, open');
});

it('write should save data as json', async () => {
  const initialFileContent = await fs.readFile(readWriteTestFile);
  expect(initialFileContent.toString()).toEqual('');

  const data = { data: 'test' };
  sutWrite.write(data);

  const fileContent = await fs.readFile(readWriteTestFile);
  expect(JSON.parse(fileContent.toString())).toEqual(data);
});
