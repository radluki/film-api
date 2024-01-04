export class Movie {
  id?: number;
  genres: string[];
  title: string;
  year: number;
  runtime: number;
  director: string;
  actors?: string;
  plot?: string;
  posterUrl?: string;
}

export class DbData {
  genres: string[];
  movies: Movie[];
}
