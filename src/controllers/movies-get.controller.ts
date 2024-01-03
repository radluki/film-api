import { Request, Response, NextFunction } from 'express';
import { MovieService } from '../services/movie.service';

export function createMoviesGetController(movieService: MovieService) {
  return (req: Request, res: Response, next: NextFunction) => {
    const duration = +req.query.duration;
    const genres = req.query.genres as string[];
    const body = movieService.getMovies(duration, genres);
    res.send(body);
  }
}