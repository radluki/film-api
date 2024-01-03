import express, { Request, Response } from 'express';
import { getArrayFieldsValidator, splitStringToArray, validate } from './middleware/validation-utils';
import { body, query } from 'express-validator';
import { MovieService } from './services/movie.service';
import { CreationFailure } from './utils/creation-result';
import { FileProxy } from './utils/file-proxy';
import bodyParser from 'body-parser';
import { StatusCodes } from 'http-status-codes';

async function main() {
  const app = express();
  const dbPath = './data/db.json';
  const fileProxy = new FileProxy(dbPath);
  const service = new MovieService(fileProxy);

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

  function getString255Validator(fieldName) {
    return (value) => {
      if (typeof value !== 'string') throw new Error(`${fieldName} is a required string with max length 255`);
      if (value.length > 255)
        throw new Error(`${fieldName} is too long, max length is 255, actual length is ${value.length}`);
      return true;
    }
  }

  const validatePostBody = validate([
    body().custom(validateBodyFieldNames),
    body('title').custom(getString255Validator('title')),
    body('year').isNumeric().withMessage('numeric year is required'),
    body('runtime').isNumeric().withMessage('numeric runtime is required'),
    body('director').custom(getString255Validator('director')),
    body('genres').custom(allowedGenresValidator),
    body('actors').optional().isString().withMessage('actors is optional string'),
    body('plot').optional().isString().withMessage('plot is optional string'),
    body('posterUrl').optional().isURL().withMessage('posterUrl is an optional valid URL'),
  ]);

  app.post('/movies', validatePostBody, async (req: Request, res: Response) => {
    const body = req.body;
    const result = await service.createMovie(body);
    if (result instanceof CreationFailure) {
      res.status(result.status).json({ errors: [result.error] });
      return;
    }
    res.status(StatusCodes.CREATED).json(result);
  });

  const port = 3000;

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

main().catch((err) => console.error(err));