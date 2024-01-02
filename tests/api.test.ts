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