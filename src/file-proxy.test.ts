import { FileProxy, IMutex } from "./file-proxy";
import fs from 'fs/promises';

const mutexMock = {
  lock: jest.fn(),
  isLocked: jest.fn(),
};
const readOnlyTestFile = './data/test-db.json';
const readWriteTestFile = './data/test-db-write.json';

const sut = new FileProxy(readOnlyTestFile, mutexMock);
const sutWrite = new FileProxy(readWriteTestFile, mutexMock);
let unlockCalled = false;

beforeEach(async () => {
  jest.clearAllMocks();
  await fs.writeFile(readWriteTestFile, '');
  unlockCalled = false;
  mutexMock.lock.mockResolvedValue(() => { unlockCalled = true; });
});

it('read should call mutex lock', async () => {
  await sut.read();
  expect(mutexMock.lock).toHaveBeenCalled();
  expect(unlockCalled).toBeTruthy();
});

it('read on invalid path should reject and release mutex', async () => {
  const sutInvalidPath = new FileProxy('./invalid/db.json', mutexMock);
  expect(unlockCalled).toBeFalsy();
  await expect(sutInvalidPath.read()).rejects.toThrow('ENOENT: no such file or directory, open');
  expect(mutexMock.lock).toHaveBeenCalled();
  expect(unlockCalled).toBeTruthy();
});

it('write should save data as json and call mutex lock/unlock', async () => {
  const initialFileContent = await fs.readFile(readWriteTestFile);
  expect(initialFileContent.toString()).toEqual('');

  const data = { data: 'test' };
  await sutWrite.write(data);
  expect(mutexMock.lock).toHaveBeenCalled();
  expect(unlockCalled).toBeTruthy();

  const fileContent = await fs.readFile(readWriteTestFile);
  expect(JSON.parse(fileContent.toString())).toEqual(data);
});
