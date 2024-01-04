import { Router, json } from "express";
import { IMovieService } from "../services/movie.service";
import { validateMoviesGetQuery } from "../middleware/movies-get-query.validation";
import { validateMoviesPostBody } from "../middleware/movies-post-body.validation";
import { createMoviesGetController } from "../controllers/movies-get.controller";
import { createMoviesPostController } from "../controllers/movies-post.controller";
import { errorHandler } from "../middleware/error-handler";

export function createMoviesRouter(movieService: IMovieService) {
  const moviesRouter = Router();
  moviesRouter.use(json());

  const moviesGetController = createMoviesGetController(movieService);
  const moviesPostController = createMoviesPostController(movieService);

  moviesRouter.get("/", validateMoviesGetQuery, moviesGetController);
  moviesRouter.post("/", validateMoviesPostBody, moviesPostController);
  moviesRouter.use(errorHandler);

  return moviesRouter;
}
