export class Movie {
  id?: number;
  genres: string[];
  title: string;
  year: string;
  runtime: string;
  director: string;
  actors?: string;
  plot?: string;
  posterUrl?: string;
}

export class DbData {
  genres: string[];
  movies: Movie[];
}