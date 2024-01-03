import { Request, Response } from 'express';
import { IMovieService } from '../services/movie.service';
import { StatusCodes } from 'http-status-codes';
import { CreationFailure } from '../utils/creation-result';

export function createMoviesPostController(movieService: IMovieService) {
  return (req: Request, res: Response) => {
    const body = req.body;
    const result = movieService.createMovie(body);
    if (result instanceof CreationFailure) {
      res.status(result.status).json({ errors: [result.error] });
      return;
    }
    res.status(StatusCodes.CREATED).json(result);
  }
}