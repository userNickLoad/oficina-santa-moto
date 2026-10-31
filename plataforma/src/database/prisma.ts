import dotenv from "dotenv"
import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

dotenv.config({ path: "../.env" });

const connectionString =
    `postgresql://postgres:` +
    `${encodeURIComponent(process.env.BD_PASSWORD!)}@` +
    `127.0.0.1:5433/santa_moto`;

const adapter = new PrismaPg({
    connectionString,
});

const prisma = new PrismaClient({
    adapter,
});

export default prisma;