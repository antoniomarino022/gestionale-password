import express, { Response, Request } from "express";
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { v4 as uuid } from 'uuid';
import logger from '../middleware/logger';
import { validateEmail, validatePassword } from "../middleware/validator";

export const routerUser = express.Router();

let dbPromise: Promise<any>;

export async function getDb() {
  if (!dbPromise) {
    dbPromise = open({
      filename: 'mydb.sqlite',
      driver: sqlite3.Database
    });
  }
  return dbPromise;
}


interface userBody{
    id:string,
    idUser:string,
    email:string,
    password:string
}


export class ModelUser{

    async registerUser(req: Request, res: Response) {
        try {
          const db = await getDb(); 
      
          const { email, password }: userBody = req.body;
      
          const id = uuid();
          const idUser = uuid();
      
          if (!email || !password) {
            logger.info("Email o password mancanti");
            return res.status(400).json({ message: "Email e password sono obbligatorie" });
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
          const verifyUser = await db.get("SELECT id FROM user WHERE email = ?", [email]);
      
          if (verifyUser) {
            logger.info("Utente già esistente");
            return res.status(409).json({ message: "Utente già registrato" });
          }
      
       
          logger.info("Tentativo di registrazione dell'utente");
          const result = await db.run(
            "INSERT INTO user (id, idUser, email, password) VALUES (?, ?, ?, ?)",
            [id, idUser, email, password]
          );
      
          if (result.changes > 0) {
            logger.info("Utente registrato con successo");
            return res.status(201).json({ message: "Utente registrato con successo" });
          } else {
            logger.info("Registrazione utente fallita");
            return res.status(500).json({ message: "Errore durante la registrazione" });
          }
        } catch (err) {
    
          if (err instanceof Error) {
            logger.error(`Errore JavaScript: ${err.message}`);
            return res.status(500).json({ message: "Errore interno", errore: err.message });
          } else {
            logger.error("Errore sconosciuto");
            return res.status(500).json({ message: "Errore sconosciuto" });
          }
        }
      }
      
}
