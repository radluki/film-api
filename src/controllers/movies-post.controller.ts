import { Request, Response } from 'express';
import { MovieService } from '../services/movie.service';
import { StatusCodes } from 'http-status-codes';
import { CreationFailure } from '../utils/creation-result';

export function createMoviesPostController(movieService: MovieService) {
  return async (req: Request, res: Response) => {
    const body = req.body;
    const result = await movieService.createMovie(body);
    if (result instanceof CreationFailure) {
      res.status(result.status).json({ errors: [result.error] });
      return;
    }
    res.status(StatusCodes.CREATED).json(result);
  }
}