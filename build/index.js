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
   
  `);
    });
}
initializeDatabase();
app.listen(port, () => {
    console.log(`Server in ascolto su http://localhost:${port}`);
});
