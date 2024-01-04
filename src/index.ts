import express from 'express';
import { IMovieService, MovieService } from './services/movie.service';
import { FileProxy } from './utils/file-proxy';
import bodyParser from 'body-parser';
import { DBPATH, PORT } from './config';
import { errorHandler } from './middleware/error-handler';
import { NumericConversionsFileProxyDecorator } from './utils/file-proxy-decorator';
import { createMoviesRouter } from './routers/movies.router';


const fileProxy = new FileProxy(DBPATH);
const fileProxyWithNumericConversions = new NumericConversionsFileProxyDecorator(fileProxy);
const movieService: IMovieService = new MovieService(fileProxyWithNumericConversions);

const app = express();
app.use(bodyParser.json());
app.use('/movies', createMoviesRouter(movieService));
app.use(errorHandler); // Should be the last app.use() call
app.listen(PORT, () => console.log(`Movie Server is running on http://localhost:${PORT}`));
