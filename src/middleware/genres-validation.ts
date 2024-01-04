import { GENRES } from "../config";
import { getArrayFieldsValidator } from "./validation-utils";

export const genresValidator = getArrayFieldsValidator(GENRES);
