import express, {Request, Response} from "express";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import apiRouters from "./routes/apiRouters.js"
import cookieParser from "cookie-parser";
import paginasRoutes from './routes/paginasRoutes.js'
import { authMiddleware } from "./middlewares/authMiddleware.js";
import { upload } from "./middlewares/multerConfig.js";

const app = express();

// APLICANDO CONFIGURAÇÕES
dotenv.config({path: "../.env"});
const PORT = Number(process.env.APP_PORT) || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('views', path.join(__dirname, './view'));

app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// APLICANDO CONFIGURAÇÕES


app.use("/", paginasRoutes);

app.use("/files", authMiddleware, express.static("./images"))

app.use("/api", apiRouters);

app.listen(PORT, () => {
    console.log(`rodando app no: http://localhost:${PORT}/`);
})