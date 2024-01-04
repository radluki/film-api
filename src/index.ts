import express from 'express';
import { IMovieService, MovieService } from './services/movie.service';
import { FileProxy } from './utils/file-proxy';
import { DBPATH, PORT } from './config';
import { NumericConversionsFileProxyDecorator } from './utils/file-proxy-decorator';
import { createMoviesRouter } from './routers/movies.router';


const fileProxy = new FileProxy(DBPATH);
const fileProxyWithNumericConversions = new NumericConversionsFileProxyDecorator(fileProxy);
const movieService: IMovieService = new MovieService(fileProxyWithNumericConversions);

const app = express();
app.use('/movies', createMoviesRouter(movieService));
app.listen(PORT, () => console.log(`Movie Server is running on http://localhost:${PORT}`));
