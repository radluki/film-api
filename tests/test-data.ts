import { Movie } from "../src/models/db.types";

export const movie: Movie = {
  title: "Beetlejuice 2",
  year: "1988",
  runtime: "1000",
  genres: [
    "Comedy",
    "Fantasy"
  ],
  director: "Tim Burton",
  posterUrl: "https://dummy.jpg",
  actors: "Johnny Depp, Winona Ryder, Dianne Wiest, Anthony Michael Hall",
};

export const dbPath = './data/db.json';
