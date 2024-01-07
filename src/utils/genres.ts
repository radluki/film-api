import { GENRES } from "../config";


export function isGenreValid(genre) {
  return GENRES.includes(genre);
}