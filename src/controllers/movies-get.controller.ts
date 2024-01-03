import { Request, Response } from 'express';
import { MovieService } from '../services/movie.service';

export function createMoviesGetController(movieService: MovieService) {
  return async (req: Request, res: Response) => {
    const duration = +req.query.duration;
    const genres = req.query.genres as string[];
    const body = await movieService.getMovies(duration, genres);
    res.send(body);
  }
}