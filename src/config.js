import { config } from "dotenv";

config();

export default {
    host: process.env.HOST_BD || process.env.HOST_BD_LOCAL,
    database: process.env.DATABASE || rocess.env.DATABASE_LOCAL,
    user: process.env.USER || process.env.USER_LOCAL,
    password: process.env.PASSWORD || process.env.PASSWORD_LOCAL
};
