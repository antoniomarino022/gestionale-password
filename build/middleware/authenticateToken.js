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
        return res.status(401).json({ message: "Token mancante" });
    }
    // Verifica il token
    jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Token non valido" });
        }
        if (!user) {
            return res.status(403).json({ message: "Utente non trovato" });
        }
        req.user = user;
        const idUserFromParams = req.params.idUser;
        if (user.id !== idUserFromParams) {
            return res.status(403).json({ message: "Il token non corrisponde all'utente richiesto" });
        }
        next();
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
