import * as dotenv from 'dotenv';

dotenv.config();

export const DBPATH: string = process.env.DBPATH;
export const PORT: number = parseInt(process.env.PORT);