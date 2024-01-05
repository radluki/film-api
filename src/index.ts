import express from "express";
import { IMovieService, MovieService } from "./services/movie.service";
import { FileProxy } from "./utils/file-proxy";
import { DBPATH, PORT } from "./config";
import { DbProxyValidatingAdapter } from "./utils/db-proxy";
import { createMoviesRouter } from "./routers/movies.router";
import { healthckeckController } from "./controllers/healthcheck.controller";
import morgan from 'morgan';

const fileProxy = new FileProxy(DBPATH);
const dbProxy = new DbProxyValidatingAdapter(fileProxy);
const movieService: IMovieService = new MovieService(dbProxy);

const app = express();
app.use(morgan('dev'));
app.use("/movies", createMoviesRouter(movieService));
app.get("/healthcheck", healthckeckController);
app.listen(PORT, () =>
  console.log(`Movie Server is running on http://localhost:${PORT}`),
);
