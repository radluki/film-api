import { Mutex } from "../src/file-proxy";

const timeout = 300;

it('lock should synchronize execution', async () => {
  const mutex = new Mutex(timeout);
  const results = [];
  expect(mutex.isLocked()).toBeFalsy();

  const p1 = mutex.lock();
  const p2 = mutex.lock();
  const p3 = mutex.lock();

  p2.then((unlock) => {
    results.push(2);
    unlock();
    expect(results).toEqual([1, 2])
  })
  p3.then((unlock) => {
    results.push(3);
    unlock();
    expect(results).toEqual([1, 2, 3])
  })
  p1.then((unlock) => {
    results.push(1);
    unlock();
    expect(results).toEqual([1])
  })

  await Promise.all([p3, p1, p2])
  
  expect(results).toEqual([1, 2, 3])
});

it('should reject after timeout', async () => {
  const mutex = new Mutex(timeout);

  expect(mutex.isLocked()).toBeFalsy();
  const unlock = await mutex.lock();
  expect(mutex.isLocked()).toBeTruthy();

  await expect(mutex.lock()).rejects.toThrow('Mutex lock timeout');
  
  expect(mutex.isLocked()).toBeTruthy();
  unlock();
  expect(mutex.isLocked()).toBeFalsy();
})

it('should return correct isLocked value', async () => {
  const mutex = new Mutex(timeout);

  expect(mutex.isLocked()).toBeFalsy();

  const unlock = await mutex.lock();
  expect(mutex.isLocked()).toBeTruthy();

  unlock();
  expect(mutex.isLocked()).toBeFalsy();

  const unlock2 = await mutex.lock();
  expect(mutex.isLocked()).toBeTruthy();
})