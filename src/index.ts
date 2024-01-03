import express, { Request, Response } from 'express';
import { getArrayFieldsValidator, splitStringToArray, validate } from './validation.middleware';
import { body, query } from 'express-validator';
import { ServerService } from './server.service';
import { FileProxy, Mutex } from './file-proxy';
import bodyParser from 'body-parser';

async function main() {
  const app = express();
  const timeout = 1000;
  const dbPath = './data/db.json';
  const mutex = new Mutex(timeout);
  const fileProxy = new FileProxy(dbPath, mutex);
  const service = new ServerService(fileProxy);

  const allowedGenres = await service.getGenres();
  const allowedGenresValidator = getArrayFieldsValidator(allowedGenres);

  app.use(bodyParser.json());

  app.get('/hello', (req: Request, res: Response) => {
    res.send('Hello, World!');
  });

  const valdateMoviesGetQuery = validate([
    query('duration').optional().isNumeric().withMessage('Duration must be a number'),
    query('genres')
      .optional()
      .customSanitizer(splitStringToArray)
      .custom(allowedGenresValidator),
  ]);

  app.get('/movies', valdateMoviesGetQuery, async (req: Request, res: Response) => {
    const duration = +req.query.duration;
    const genres = req.query.genres as string[];
    const body = await service.getMovies(duration, genres);
    res.send(body);
  })

  function validateBodyFieldNames(value) {
    const allowedFields = ['title', 'year', 'runtime', 'director', 'genres', 'actors', 'plot', 'posterUrl'];
    const unknownFields = Object.keys(value).filter(field => !allowedFields.includes(field));
    if (unknownFields.length == 0) return true;
    throw new Error(`Unknown fields: ${unknownFields.join(', ')}`);
  }

  const validatePostBody = validate([
    body().custom(validateBodyFieldNames),
    body('title').isString().withMessage('title is required'),
    body('year').isNumeric().withMessage('numeric year is required'),
    body('runtime').isNumeric().withMessage('numeric runtime is required'),
    body('director').isString().withMessage('director is required'),
    body('genres').custom(allowedGenresValidator),
    body('actors').optional().isString().withMessage('actors is optional string'),
    body('plot').optional().isString().withMessage('plot is optional string'),
    body('posterUrl').optional().isURL().withMessage('posterUrl is an optional valid URL'),
  ]);

  app.post('/movies', validatePostBody, async (req: Request, res: Response) => {
    const body = req.body;
    console.log(body);
    res.sendStatus(201);
  });

  const port = 3000;

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

main().catch((err) => console.error(err));