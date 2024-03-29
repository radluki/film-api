import { Request, Response } from "express";
import { IMovieService } from "../services/movie.service";

export function createMoviesGetController(movieService: IMovieService) {
  return (req: Request, res: Response) => {
    const duration = +req.query.duration || undefined;
    const genres = req.query.genres && [].concat(req.query.genres as string[]);
    const body = movieService.getMovies(duration, genres);
    res.send(body);
  };
}
