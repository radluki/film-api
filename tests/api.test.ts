import request from 'supertest';

const url = 'http://localhost:3000';


it('/hello GET', () => {
  return request(url).get('/hello')
    .expect(200)
    .expect('Content-Type', /text/)
    .expect((res) => {
      expect(res.text).toEqual('Hello, World!');
    });
});

describe('/movies GET - query parameter validation', () => {
  it('query params should be optional', () => {
    return request(url).get('/movies')
      .expect(200)
      .expect('Content-Type', /text/)
      .expect((res) => {
        expect(res.text).toEqual('ok');
      });
  })

  it('duration can be a number', () => {
    return request(url).get('/movies?duration=10')
      .expect(200)
      .expect('Content-Type', /text/)
      .expect((res) => {
        expect(res.text).toEqual('ok');
      });
  })

  it('duration cannot be a string', () => {
    return request(url).get('/movies?duration="10"')
      .expect(400)
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.body.errors[0]).toEqual('Duration must be a number');
      });
  })

  it('genres can be an array of strings defined in db.genres', () => {
    return request(url).get('/movies?genres=Thriller,Mystery')
      .expect(200)
      .expect('Content-Type', /text/)
      .expect((res) => {
        expect(res.text).toEqual('ok');
      });
  })

  it('genres can be a string', () => {
    return request(url).get('/movies?genres=Animation')
      .expect(200)
      .expect('Content-Type', /text/)
      .expect((res) => {
        expect(res.text).toEqual('ok');
      });
  })

  it('1/1 genre not mentioned in db.genres should cause bad request', () => {
    return request(url).get('/movies?genres=tralala')
      .expect(400)
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.body.errors).toEqual(['Invalid genres: tralala']);
      });
  })

  it('2/2 genres not mentioned in db.genres should cause bad request', () => {
    return request(url).get('/movies?genres=tralala,blabla')
      .expect(400)
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.body.errors).toEqual(['Invalid genres: tralala, blabla']);
      });
  })

  it('1/2 genres not mentioned in db.genres should cause bad request', () => {
    return request(url).get('/movies?genres=Animation,blabla')
      .expect(400)
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.body.errors).toEqual(['Invalid genres: blabla']);
      });
  })
})
