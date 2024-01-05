import { GENRES } from "../config";

export const genresValidator = (value: string[]) => {
  const invalid = value.filter((item) => !GENRES.includes(item));
  if (invalid.length == 0) return true;
  throw new Error(`Invalid genres: ${invalid.join(", ")}`);
};
