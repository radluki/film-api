import express, { Request, Response } from 'express';
import { getArrayFieldsValidator, splitStringToArray, validate } from './middleware/validation-utils';
import { body, query } from 'express-validator';
import { MovieService } from './services/movie.service';
import { CreationFailure } from './utils/creation-result';
import { FileProxy } from './utils/file-proxy';
import bodyParser from 'body-parser';
import { StatusCodes } from 'http-status-codes';
import { DBPATH, PORT } from './config';
import { getMoviesGetQueryValidator } from './middleware/movies-get-query.validation';
import { getMoviesPostBodyValidator } from './middleware/movies-post-body.validation';

async function main() {
  const app = express();
  app.use(bodyParser.json());
  const fileProxy = new FileProxy(DBPATH);
  const service = new MovieService(fileProxy);

  app.get('/hello', (req: Request, res: Response) => {
    res.send('Hello, World!');
  });

  const allowedGenres = await service.getGenres();
  const moviesGetQueryValidator = getMoviesGetQueryValidator(allowedGenres);

  app.get('/movies', moviesGetQueryValidator, async (req: Request, res: Response) => {
    const duration = +req.query.duration;
    const genres = req.query.genres as string[];
    const body = await service.getMovies(duration, genres);
    res.send(body);
  })

  const moviesPostBodyValidator = getMoviesPostBodyValidator(allowedGenres);

  app.post('/movies', moviesPostBodyValidator, async (req: Request, res: Response) => {
    const body = req.body;
    const result = await service.createMovie(body);
    if (result instanceof CreationFailure) {
      res.status(result.status).json({ errors: [result.error] });
      return;
    }
    res.status(StatusCodes.CREATED).json(result);
  });

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

main().catch((err) => console.error(err));