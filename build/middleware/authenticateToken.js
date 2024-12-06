"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = void 0;
exports.authenticateToken = authenticateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Token mancante" });
        return; // Assicurati di terminare qui
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            res.status(403).json({ message: "Token non valido" });
            return; // Assicurati di terminare qui
        }
        // Aggiungi i dettagli dell'utente verificato alla richiesta
        req.user = user;
        next(); // Passa al middleware successivo
    });
}
// Funzione per generare un token di accesso JWT
const generateAccessToken = (userId) => {
    // Il payload contiene l'ID dell'utente
    const payload = { id: userId };
    // Genera un token JWT firmato con la chiave segreta e un tempo di scadenza di 1800 secondi (30 minuti)
    return jsonwebtoken_1.default.sign(payload, process.env.TOKEN_SECRET, { expiresIn: "1800s" });
};
exports.generateAccessToken = generateAccessToken;
