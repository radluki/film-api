import express from 'express';
import { IMovieService, MovieService } from './services/movie.service';
import { FileProxy } from './utils/file-proxy';
import bodyParser from 'body-parser';
import { DBPATH, PORT } from './config';
import { validateMoviesGetQuery } from './middleware/movies-get-query.validation';
import { validateMoviesPostBody } from './middleware/movies-post-body.validation';
import { createMoviesGetController } from './controllers/movies-get.controller';
import { createMoviesPostController } from './controllers/movies-post.controller';
import { errorHandler } from './middleware/error-handler';
import { NumericConversionsFileProxyDecorator } from './utils/file-proxy-decorator';

function main() {
  const app = express();
  app.use(bodyParser.json());
  const fileProxy = new FileProxy(DBPATH);
  const fileProxyWithNumericConversions = new NumericConversionsFileProxyDecorator(fileProxy);
  const movieService: IMovieService = new MovieService(fileProxyWithNumericConversions);

  const moviesGetController = createMoviesGetController(movieService);
  const moviesPostController = createMoviesPostController(movieService);

  const MOVIES_URL = '/movies';
  app.get(MOVIES_URL, validateMoviesGetQuery, moviesGetController);
  app.post(MOVIES_URL, validateMoviesPostBody, moviesPostController);
  app.use(errorHandler); // Should be the last to overwite the default error handler
  app.listen(PORT, () => console.log(`Movie Server is running on http://localhost:${PORT}`));
}

main();
