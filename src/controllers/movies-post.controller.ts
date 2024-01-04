import { Request, Response } from 'express';
import { IMovieService } from '../services/movie.service';

export function createMoviesPostController(movieService: IMovieService) {
  return (req: Request, res: Response) => {
    const result = movieService.createMovie(req.body);
    res.status(result.status).json(result.message);
  }
}