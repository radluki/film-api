export const url = 'http://localhost:3000';

export const expectObjectToBeAMovie = (obj: any) => {
  expect(obj).toHaveProperty('id');
  expect(obj).toHaveProperty('title');
  expect(obj).toHaveProperty('year');
  expect(obj).toHaveProperty('runtime');
  expect(obj).toHaveProperty('genres');
  expect(obj).toHaveProperty('director');

  expect(obj.id).toEqual(expect.any(Number));
  expect(obj.title).toEqual(expect.any(String));
  const year = parseInt(obj.year, 10);
  expect(year).toEqual(expect.any(Number));
  const runtime = parseInt(obj.runtime, 10);
  expect(runtime).toEqual(expect.any(Number));
  expect(obj.genres).toEqual(expect.any(Array));
  expect(obj.director).toEqual(expect.any(String));
  if (obj.actors) expect(obj.actors).toEqual(expect.any(String));
  if (obj.plot) expect(obj.plot).toEqual(expect.any(String));
  if (obj.posterUrl) expect(obj.posterUrl).toEqual(expect.any(String));
}

export const expectListOfMovies = (list: any) => {
  expect(list).toEqual(expect.any(Array));
  expect(list.length).toBeGreaterThan(0);
  list.forEach(expectObjectToBeAMovie);
}