import express, { Request, Response } from 'express';
import { getArrayFieldsValidator, splitStringToArray, validate } from './validation.middleware';
import { query } from 'express-validator';
import { ServerService } from './server.service';
import { FileProxy, Mutex } from './file-proxy';

async function main() {
  const app = express();
  const timeout = 1000;
  const dbPath = './data/db.json';
  const mutex = new Mutex(timeout);
  const fileProxy = new FileProxy(dbPath, mutex);
  const service = new ServerService(fileProxy);

  const allowedGenres = await service.getGenres();
  const allowedGenresValidator = getArrayFieldsValidator(allowedGenres);

  app.get('/hello', (req: Request, res: Response) => {
    res.send('Hello, World!');
  });


  app.get('/movies', validate([
    query('duration').optional().isNumeric().withMessage('Duration must be a number'),
    query('genres')
      .optional()
      .customSanitizer(splitStringToArray)
      .custom(allowedGenresValidator),
  ]), async (req: Request, res: Response) => {
    const duration = +req.query.duration;
    const genres = req.query.genres as string[];
    const body = await service.getMovies(duration, genres);
    res.send(body);
  })

  const port = 3000;

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

main().catch((err) => console.error(err));