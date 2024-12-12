import express, { Response, Request, NextFunction } from "express";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { v4 as uuid } from "uuid";
import logger from "../middleware/logger";
import { validateEmail, validatePassword } from "../middleware/validator";
import * as bcrypt from "bcrypt";
import jwt, { JwtPayload } from 'jsonwebtoken';

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

export class ModelUser {
  // clean table user
  async cleanTableUser(req: Request, res: Response, next: NextFunction) {
    try {
      const db = await getDb();
      const result = await db.run("DELETE FROM user");

      if (result.changes > 0) {
        logger.info("tabella svuotata con successo");
        res.status(200).json({
          message: "tabella svuotata con successo",
        });
      } else {
        logger.info("tabella non svuotata ");
        res.status(400).json({
          message: "tabella non svuotata ",
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        logger.error(`errore standard di js:${err.message}`);
        res.status(500).json({
          message: "errore standard di js",
          errore: err.message,
        });
      } else {
        logger.error("errore sconosciuto");
        res.status(500).json({
          message: "errore sconosciuto",
        });
      }
    }
  }



  // registrazione utente
  async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      const db = await getDb();

      const { email, password }: userBody = req.body;

      const id = uuid();
      const idUser = uuid();

      if (!email || !password) {
        logger.info("Email o password mancanti");
        return res
          .status(400)
          .json({ message: "Email e password sono obbligatorie" });
      }

      if (!validateEmail(email)) {
        logger.info("Email non valida");
        return res.status(400).json({ message: "Email non valida" });
      }

      if (!validatePassword(password)) {
        logger.info("Password non valida");
        return res.status(400).json({ message: "Password non valida" });
      }

      logger.info("Verifica dell'utente esistente");
      const verifyUser = await db.get("SELECT id FROM user WHERE email = ?", [
        email,
      ]);

      if (verifyUser) {
        logger.info("Utente già esistente");
        return res.status(409).json({ message: "Utente già registrato" });
      }

      logger.info("Tentativo di registrazione dell'utente");
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      const result = await db.run(
        "INSERT INTO user (id, idUser, email, password) VALUES (?, ?, ?, ?)",
        [id, idUser, email, passwordHash]
      );

      if (result.changes > 0) {
        logger.info("Utente registrato con successo");
        return res
          .status(201)
          .json({ message: "Utente registrato con successo" });
      } else {
        logger.info("Registrazione utente fallita");
        return res
          .status(500)
          .json({ message: "Errore durante la registrazione" });
      }
    } catch (err) {
      if (err instanceof Error) {
        logger.error(`Errore standard di Js: ${err.message}`);
        return res
          .status(500)
          .json({ message: "Errore standard di Js:", errore: err.message });
      } else {
        logger.error("Errore sconosciuto");
        return res.status(500).json({ message: "Errore sconosciuto" });
      }
    }
  }



  
// update user
async updateUser(req: Request, res: Response, next: NextFunction){
  
  try {
    const db = await getDb();

    const { idUser } = req.params;

    if (!idUser) {
      logger.info("id mancante");
      return res.status(400).json({
        message: "id mancante",
      });
    }
    
    const { email, password }: userBody = req.body;

    if (!email || !password) {
      logger.info("Email o password mancanti");
      return res
        .status(400)
        .json({ message: "Email e password sono obbligatorie" });
    }

    if (!validateEmail(email)) {
      logger.info("Email non valida");
      return res.status(400).json({ message: "Email non valida" });
    }

    if (!validatePassword(password)) {
      logger.info("Password non valida");
      return res.status(400).json({ message: "Password non valida" });
    }

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

    const verifyAuth = await db.get("SELECT token FROM auth");

    if (!verifyAuth) {
      logger.info("l'utente non è autorizzato");
    }


    const user = await db.get('SELECT * FROM user WHERE idUser = ?', [idUser]);

    if (!user) {
      logger.warn('Utente non trovato');
      return res.status(404).json({
        message:"utente non trovato"
      }); 
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await db.run('UPDATE user SET email = ?, password = ?', [email, passwordHash]);

    if (result.changes > 0) {
      logger.info(`Utente modificato con successo`);
      return res.status(200).json({ message: "Utente modificato con successo" });
    } else {
      logger.error("Nessuna modifica applicata all'utente");
      return res.status(304).json({ message: "Nessuna modifica applicata all'utente" });
    }
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`Errore standard di Js: ${err.message}`);
      return res
        .status(500)
        .json({ message: "Errore standard di Js:", errore: err.message });
    } else {
      logger.error("Errore sconosciuto");
      return res.status(500).json({ message: "Errore sconosciuto" });
    }
  }
}


  // Delete user
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const db = await getDb();

      const { idUser } = req.params;

      if (!idUser) {
        logger.info("id mancante");
        return res.status(400).json({
          message: "id mancante",
        });
      }

      const verifyUser = await db.get(
        "SELECT idUser FROM user WHERE idUser = ?",
        [idUser]
      );

      if (!verifyUser) {
        logger.info("utente non esistente");
        return res.status(400).json({
          message: "utente non esistente",
        });
      }

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
  

      const verifyAuth = await db.get("SELECT token FROM auth");

      if (!verifyAuth) {
        logger.info("l'utente non è autorizzato");
      }

      logger.info('tentavivo di autorizzazione ricevuto', { token });


      const result = await db.run("DELETE FROM user WHERE idUser = ?", [
        idUser,
      ]);

      if (result.changes > 0) {
        logger.info("utente eliminato con successo");
        return res.status(200).json({
          message: "utente eliminato con successo",
        });
      } else {
        logger.info("utente non eliminato");
        return res.status(400).json({
          message: "utente non eliminato",
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        logger.error(`Errore standard di Js: ${err.message}`);
        return res
          .status(500)
          .json({ message: "Errore standard di Js:", errore: err.message });
      } else {
        logger.error("Errore sconosciuto");
        return res.status(500).json({ message: "Errore sconosciuto" });
      }
    }
  }
}

export const modelUser = new ModelUser();
