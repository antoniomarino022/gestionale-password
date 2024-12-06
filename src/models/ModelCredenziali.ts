import express, { Response, Request, NextFunction } from "express";
import logger from "../middleware/logger";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { v4 as uuid } from "uuid";
import { validateEmail, validatePassword } from "../middleware/validator";
import * as bcrypt from "bcrypt";

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
  async registerPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const db = await getDb();
      const { username, email, password, service }: CredenzialiBody = req.body;

      if (!username) {
        logger.info("username non inserito");
        return res.status(400).json({ message: "username non inserito" });
      }

      if (!validateEmail(email)) {
        logger.info("email mancante o non valida");
        return res.status(400).json({ message: "email mancante o non valida" });
      }

      if (!validatePassword(password)) {
        logger.info("password mancante o non valida");
        return res.status(400).json({ message: "password mancante o non valida" });
      }

      if (!service) {
        logger.info("servizio non inserito");
        return res.status(400).json({ message: "servizio non inserito" });
      }

      const verifyPassword = await db.get("SELECT password FROM credenziali WHERE password = ?", [password]);
      if (verifyPassword) {
        logger.info("password già esistente per quel servizio");
        return res.status(400).json({ message: "password già esistente per quel servizio" });
      }

      const userVerify = await db.get("SELECT * FROM user WHERE email = ?", [email]);
      if (!userVerify) {
        logger.info("User not found");
        return res.status(404).json({ message: "User not found" });
      }
      const idUser = userVerify.idUser;

      const authHeader = req.headers["authorization"];
      if (!authHeader) {
        logger.warn("Nessun header di autorizzazione presente");
        return res.status(401).json({ message: "Autorizzazione mancante" });
      }
      const token = authHeader && authHeader.split(" ")[1];

      if (token == null)
        return res.sendStatus(401).json({ message: "Token NON VALIDO" });

      const verifyAuth = await db.get("SELECT token FROM auth");

      if (!verifyAuth) {
        logger.info("l'utente non è autorizzato");
      }

      logger.info('tentavivo di autorizzazione ricevuto', { token });


      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);
      const id = uuid();

      const result = await db.run(
        "INSERT INTO credenziali (username, email, password, id, idUser) VALUES (?, ?, ?, ?, ?)",
        [username, email, passwordHash, id, idUser]
      );

      if (result.changes > 0) {
        logger.info("credenziali aggiunte con successo");
        return res.status(201).json({ message: "credenziali aggiunte con successo" });
      } else {
        logger.info("credenziali non aggiunte");
        return res.status(500).json({ message: "credenziali non aggiunte" });
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
