import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Estendi il tipo Request per includere i dati dell'utente autenticato
interface JwtRequest extends Request {
  user?: any; // Puoi specificare un tipo più preciso se necessario
}

export function authenticateToken(req: JwtRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Token mancante" });
    return; // Assicurati di terminare qui
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
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
export const generateAccessToken = (userId: string) => {
  // Il payload contiene l'ID dell'utente
  const payload = { id: userId };

  // Genera un token JWT firmato con la chiave segreta e un tempo di scadenza di 1800 secondi (30 minuti)
  return jwt.sign(payload, process.env.TOKEN_SECRET!, { expiresIn: "1800s" });
};