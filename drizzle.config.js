"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing");
}
exports.default = {
    schema: "./src/schema.ts",
    out: "./drizzle",
    driver: "pg",
    dbCredentials: {
        connectionString: process.env.DATABASE_URL,
    },
};
