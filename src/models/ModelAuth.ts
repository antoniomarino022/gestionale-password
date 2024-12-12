import express, { Response, Request, NextFunction } from "express";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { v4 as uuid } from "uuid";
import logger from "../middleware/logger";
import * as bcrypt from "bcrypt";
import { validateEmail, validatePassword } from "../middleware/validator";
import { generateAccessToken } from "../middleware/authenticateToken";



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

interface userBody {
  email: string;
  password: string;
}

export class modelAuth {

  // clean table auth
  
  async cleanTableAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const db = await getDb();
      const result = await db.run("DELETE FROM auth");
  
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

  // login
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const db = await getDb();
      const { email, password }: userBody = req.body;

      const id = uuid();

      if (!email) {
        logger.warn("email mancante nella richiesta");
        return res.status(400).json({ message: "email mancante o non valido" });
      }
      if (!password) {
        logger.warn("Password mancante nella richiesta");
        return res
          .status(400)
          .json({ message: "Password mancante o non valida" });
      }

      if (!validateEmail(email)) {
        logger.warn(`email non valida ${email}`);
        return res.status(400).json({
          message: "email non valida",
        });
      }

      if (!validatePassword(password)) {
        logger.warn(`password non valida`);
        return res.status(400).json({
          message: "password non valida",
        });
      }

      const userVerify = await db.get("SELECT * FROM user WHERE email = ?", [
        email,
      ]);

      if (!userVerify) {
        logger.warn(`Email o password non corretti ${email}`);
        return res.status(401).json({
          message: "Email o password non corretti",
        });
      }

      logger.info("tentativo di login ricevuto", email);

      const match = await bcrypt.compare(password, userVerify.password);

      if (match) {
    
        const userId = userVerify.idUser;

        if(!userId){
          logger.info("user id mancante");
          return res.status(400).json({
            message:"user id mancante"
          })
        }
        const token = generateAccessToken(userId);

        const success = await db.run(
          "INSERT INTO auth (id,idUser,token) VALUES (?,?,?)",
          [id, userId, token]
        );

        if (success.changes && success.changes > 0) {
          logger.info(`login effettuato ${email} `);
          return res.status(200).json({ message: "login effettuato", token });
        } else {
          logger.error(`si è verificato un errore durante il login ${email} `);
          return res
            .status(500)
            .json({ message: "si è verificato un errore durante il login" });
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        logger.error(`Errore JavaScript: ${err.message}`);
        return res
          .status(500)
          .json({ message: "errore standar di js", errore: err.message });
      } else {
        logger.error(`Errore sconosciuto: ${err}`);
        return res.status(500).json({ message: "Errore sconosciuto", err });
      }
    }
  }

  // logout
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const db = await getDb();

      const authHeader = req.headers["authorization"];
      if (!authHeader) {
        logger.warn("Nessun header di autorizzazione presente");
        return res.status(401).json({ message: "Autorizzazione mancante" });
      }
      const token = authHeader && authHeader.split(" ")[1];

      if (token == null)
        return res.status(401).json({ message: "Token NON VALIDO" });

      const verifyAuth = await db.get("SELECT token FROM auth");

      if (!verifyAuth) {
        logger.info("l'utente non è autorizzato");
      }

      logger.info('Tentativo di logout ricevuto', { token });

      const result = await db.run("DELETE FROM auth WHERE token = ?", [token]);

      if (result.changes > 0) {
        logger.info("logout effettuato con successo");
        return res.status(200).json({
          message: "logout effettuato con successo",
        });
      } else {
        logger.info("logout non effettuato");
        return res.status(400).json({
          message: "logout non effettuato",
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        logger.error(`Errore JavaScript: ${err.message}`);
        return res
          .status(500)
          .json({ message: "errore standar di js", errore: err.message });
      } else {
        logger.error(`Errore sconosciuto: ${err}`);
        return res.status(500).json({ message: "Errore sconosciuto", err });
      }
    }
  }
}

export const authModel = new modelAuth();
