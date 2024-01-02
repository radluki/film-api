import express, { Request, Response } from 'express';
import { splitStringToArray, validate } from './validation.middleware';
import { query } from 'express-validator';

const app = express();

app.get('/hello', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.get('/movies', validate([
  query('duration').optional().isNumeric().withMessage('Duration must be a number'),
  query('genres').optional().customSanitizer(splitStringToArray).isArray().withMessage('Genres must be an array'),
]), (req: Request, res: Response) => {
  res.send('ok');
})

const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
