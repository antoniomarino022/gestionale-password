"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const db_1 = require("./db");
const RouterUser_1 = require("./router/RouterUser");
const RouterAuth_1 = require("./router/RouterAuth");
(0, dotenv_1.config)();
const port = process.env.PORT || '3000';
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((req, res, next) => {
    console.log('Corpo Grezzo:', req.body);
    next();
});
function initializeDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = yield (0, db_1.getDb)();
        yield db.exec(`

CREATE TABLE IF NOT EXISTS user (
  id TEXT PRIMARY KEY, 
  idUser TEXT UNIQUE NOT NULL, 
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL 
);

CREATE TABLE IF NOT EXISTS auth (
  id TEXT PRIMARY KEY, 
  idUser TEXT NOT NULL, 
  token TEXT NOT NULL, 
  FOREIGN KEY(idUser) REFERENCES user (idUser) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS credenziali (
  id TEXT PRIMARY KEY,
  idUser TEXT NOT NULL,
  username TEXT NOT NULL, 
  email TEXT NOT NULL,
  password TEXT NOT NULL, 
  service TEXT NOT NULL, 
  FOREIGN KEY(idUser) REFERENCES user (idUser) ON DELETE CASCADE
);


 `);
    });
}
initializeDatabase();
app.use("/user", RouterUser_1.routerUser);
app.use("/auth", RouterAuth_1.routerAuth);
app.listen(port, () => {
    console.log(`Server in ascolto su http://localhost:${port}`);
});
