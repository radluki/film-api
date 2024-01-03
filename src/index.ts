import express from 'express';
import { IMovieService, MovieService } from './services/movie.service';
import { FileProxy } from './utils/file-proxy';
import bodyParser from 'body-parser';
import { DBPATH, PORT } from './config';
import { getMoviesGetQueryValidator } from './middleware/movies-get-query.validation';
import { getMoviesPostBodyValidator } from './middleware/movies-post-body.validation';
import { createMoviesGetController } from './controllers/movies-get.controller';
import { createMoviesPostController } from './controllers/movies-post.controller';
import { errorHandler } from './middleware/error-handler';

async function main() {
  const app = express();
  app.use(bodyParser.json());
  const fileProxy = new FileProxy(DBPATH);
  const movieService: IMovieService = new MovieService(fileProxy);

  const allowedGenres = await movieService.getGenres();
  const moviesGetQueryValidator = getMoviesGetQueryValidator(allowedGenres);
  const moviesPostBodyValidator = getMoviesPostBodyValidator(allowedGenres);
  const moviesGetController = createMoviesGetController(movieService);
  const moviesPostController = createMoviesPostController(movieService);

  const MOVIES_URL = '/movies';
  app.get(MOVIES_URL, moviesGetQueryValidator, moviesGetController);
  app.post(MOVIES_URL, moviesPostBodyValidator, moviesPostController);
  app.use(errorHandler); // Should be the last to overwite the default error handler
  app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
}

main().catch((err) => console.error(err));