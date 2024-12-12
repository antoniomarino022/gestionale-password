import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Estendi il tipo Request per includere i dati dell'utente autenticato
interface JwtRequest extends Request {
  user?: any; // Puoi specificare un tipo più preciso se necessario
}


export function authenticateToken(req: JwtRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token mancante" });
  }

  // Verifica il token
  jwt.verify(token, process.env.TOKEN_SECRET as string, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token non valido" });
    }
    if (!user) {
      return res.status(403).json({ message: "Utente non trovato" });
    }
    req.user = user;
    const idUserFromParams = req.params.idUser;

    
    if ((user as { id: string }).id !== idUserFromParams) {
      return res.status(403).json({ message: "Il token non corrisponde all'utente richiesto" });
    }

    next();
  });

  
}

// Funzione per generare un token di accesso JWT
export const generateAccessToken = (userId: string) => {
  // Il payload contiene l'ID dell'utente
  const payload = { id: userId };

  // Genera un token JWT firmato con la chiave segreta e un tempo di scadenza di 1800 secondi (30 minuti)
  return jwt.sign(payload, process.env.TOKEN_SECRET!, { expiresIn: "1800s" });
};