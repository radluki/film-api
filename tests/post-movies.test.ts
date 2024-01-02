import request from 'supertest';
import { url } from './common';

const movie = {
    title: "Beetlejuice",
    year: "1988",
    runtime: "92",
    genres: [
        "Comedy",
        "Fantasy"
    ],
    director: "Tim Burton",
    posterUrl: "https://dummy.jpg"
};
it('/movies POST - should return 201', () => {
  return request(url).post('/movies')
    .send(movie)
    .expect(201)
});

it('/movies POST - movie without title', () => {
  let invalidMovie = { ...movie };
  invalidMovie.title = undefined;
  return request(url).post('/movies')
    .send(invalidMovie)
    .expect(400)
    .expect((res) => {
      expect(res.body.errors).toEqual(['title is required']);
    });
});

it('/movies POST - movie with invalid year', () => {
  let invalidMovie = { ...movie };
  invalidMovie.year = 'invalid year';
  return request(url).post('/movies')
    .send(invalidMovie)
    .expect(400)
    .expect((res) => {
      expect(res.body.errors).toEqual(['numeric year is required']);
    });
});