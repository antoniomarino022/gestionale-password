import express, { Response, Request, NextFunction } from "express";
import logger from "../middleware/logger";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { v4 as uuid } from "uuid";
import { validateEmail, validatePassword } from "../middleware/validator";
import * as bcrypt from "bcrypt";
import { config } from 'dotenv';
import jwt, { JwtPayload } from 'jsonwebtoken';

config()


let dbPromise: Promise<any>;

export async function getDb() {
  if (!dbPromise) {
    dbPromise = open({
      filename: "mydb.sqlite",
      driver: sqlite3.Database,
    });
  }
  return dbPromise;
}

interface CredenzialiBody {
  username: string;
  email: string;
  password: string;
  service: string;
}

export class ModelCredenziali {

  // cleat table credenziali
  async cleanTableCredenziali(req: Request, res: Response, next: NextFunction) {
    try {
      const db = await getDb();
      const result = await db.run("DELETE FROM credenziali");
  
      if (result.changes > 0) {
        logger.info("tabella svuotata con successo");
        return res.status(200).json({
          message: "tabella svuotata con successo",
        });
      } else {
        logger.info("tabella non svuotata ");
        return res.status(400).json({
          message: "tabella non svuotata ",
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        logger.error(`errore standard di js:${err.message}`);
        return res.status(500).json({
          message: "errore standard di js",
          errore: err.message,
        });
      } else {
        logger.error("errore sconosciuto");
        return res.status(500).json({
          message: "errore sconosciuto",
        });
      }
    }
  };



  // registra password
  async registerPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const db = await getDb();
      const { username, email, password, service }: CredenzialiBody = req.body;
      const { idUser } = req.params;
  
      const authHeader = req.headers["authorization"];
      if (!authHeader) {
        logger.warn("Nessun header di autorizzazione presente");
        return res.status(401).json({ message: "Autorizzazione mancante" });
      }
      const token = authHeader.split(" ")[1];
  
      if (!token) {
        return res.status(401).json({ message: "Token non valido" });
      }
  
      let decodedToken: JwtPayload;
      try {
        decodedToken = jwt.verify(token, process.env.TOKEN_SECRET || "default_secret") as JwtPayload;
      } catch (err) {
        logger.error("Token non valido o scaduto");
        return res.status(401).json({ message: "Token non valido o scaduto" });
      }
  
      if (decodedToken.id !== idUser) {
        logger.warn("Token non corrisponde all'utente richiesto");
        return res.status(403).json({ message: "Accesso non autorizzato" });
      }
  
      if (!username) {
        logger.info("Username non inserito");
        return res.status(400).json({ message: "Username non inserito" });
      }
  
      if (!validateEmail(email)) {
        logger.info("Email mancante o non valida");
        return res.status(400).json({ message: "Email mancante o non valida" });
      }
  
      if (!validatePassword(password)) {
        logger.info("Password mancante o non valida");
        return res.status(400).json({ message: "Password mancante o non valida" });
      }
  
      if (!service) {
        logger.info("Servizio non inserito");
        return res.status(400).json({ message: "Servizio non inserito" });
      }
  
      const verifyPassword = await db.get("SELECT password FROM credenziali WHERE password = ?", [password]);
      if (verifyPassword) {
        logger.info("Password già esistente per quel servizio");
        return res.status(400).json({ message: "Password già esistente per quel servizio" });
      }
  
      const user = await db.get('SELECT * FROM user WHERE idUser = ?', [idUser]);
      if (!user) {
        logger.warn("Utente non trovato");
        return res.status(404).json({ message: "Utente non trovato" });
      }
  
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);
      const id = uuid();
  
      const result = await db.run(
        "INSERT INTO credenziali (id, idUser, username, email, password, service) VALUES (?, ?, ?, ?, ?, ?)",
        [id, idUser, username, email, passwordHash, service]
      );
  
      if (result.changes > 0) {
        logger.info("Credenziali aggiunte con successo");
        return res.status(201).json({ message: "Credenziali aggiunte con successo" });
      } else {
        logger.info("Credenziali non aggiunte");
        return res.status(500).json({ message: "Credenziali non aggiunte" });
      }
    } catch (err) {
      if (err instanceof Error) {
        logger.error(`Unexpected error: ${err.message}`);
        return res.status(500).json({ message: "Internal server error" });
      } else {
        logger.error("Unknown error occurred");
        return res.status(500).json({ message: "Unknown error occurred" });
      }
    }
  }
  
}

export const modelCredenziali = new ModelCredenziali();
