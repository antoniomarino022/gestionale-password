"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = require("dotenv");
const logger_1 = __importDefault(require("./logger"));
(0, dotenv_1.config)();
// Middleware per autenticare il token JWT
const authenticateToken = (req, res, next) => {
    // Estrae il token dall'header Authorization della richiesta
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        logger_1.default.warn('Nessun header di autorizzazione presente');
        return res.status(401).json({ message: 'Autorizzazione mancante' });
    }
    const token = authHeader && authHeader.split(" ")[1];
    // Se il token non è presente, restituisce uno status 401 (Unauthorized)
    if (token == null)
        return res.sendStatus(401).json({ message: "Token NON VALIDO" });
    // Verifica il token utilizzando la chiave segreta definita nelle variabili di ambiente
    jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        // Se la verifica fallisce, restituisce uno status 403 (Forbidden)
        if (err)
            return res.sendStatus(403);
        // Se la verifica ha successo, aggiunge l'utente decodificato alla richiesta e passa al prossimo middleware
        req.user = user;
        next();
    });
};
exports.authenticateToken = authenticateToken;
// Funzione per generare un token di accesso JWT
const generateAccessToken = (userId) => {
    // Il payload contiene l'ID dell'utente
    const payload = { id: userId };
    // Genera un token JWT firmato con la chiave segreta e un tempo di scadenza di 1800 secondi (30 minuti)
    return jsonwebtoken_1.default.sign(payload, process.env.TOKEN_SECRET, { expiresIn: "1800s" });
};
exports.generateAccessToken = generateAccessToken;
