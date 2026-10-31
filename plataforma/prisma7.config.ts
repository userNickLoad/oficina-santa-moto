import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

dotenv.config({path: "../.env"});

const BD_PASSWORD =  encodeURIComponent(process.env.BD_PASSWORD!);
console.log(BD_PASSWORD)
const databaseUrl =
    `postgresql://postgres:` +
    `${BD_PASSWORD}@` +
    `127.0.0.1:5433/` +
    `santa_moto`;

export default defineConfig({
    schema: "prisma/schema.prisma",
    datasource: {
        url: databaseUrl,
    },
});