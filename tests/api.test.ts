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

  // TODO restrict to array of enum
  it('genres can be an array of strings', () => {
    return request(url).get('/movies?genres=aaa,bbb')
      .expect(200)
      .expect('Content-Type', /text/)
      .expect((res) => {
        expect(res.text).toEqual('ok');
      });
  })

  it('genres can be a string', () => {
    return request(url).get('/movies?genres=aaa')
      .expect(200)
      .expect('Content-Type', /text/)
      .expect((res) => {
        expect(res.text).toEqual('ok');
      });
  })
})
