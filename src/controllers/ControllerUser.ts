import { modelUser } from "../models/ModelUser";
import logger from "../middleware/logger";
import { Request, Response, NextFunction } from "express";

export class UserController {
  //  clean table user
  async cleanTableUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await modelUser.cleanTableUser(req, res, next);
      logger.error("Errore nel controller di cleanTableUser");
      res.status(500).json({ message: "Errore interno del server" });
    } catch (err) {
      if (err instanceof Error) {
        logger.error(`Errore standard di Js: ${err.message}`);
        res
          .status(500)
          .json({ message: "Errore standard di Js:", errore: err.message });
      } else {
        logger.error("Errore sconosciuto");
        res.status(500).json({ message: "Errore sconosciuto" });
      }
    }
  }

  // register user
  async registerUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await modelUser.registerUser(req, res, next);
    } catch (err) {
      if (err instanceof Error) {
        logger.error(`Errore standard di Js: ${err.message}`);
        res
          .status(500)
          .json({ message: "Errore standard di Js:", errore: err.message });
      } else {
        logger.error("Errore sconosciuto");
        res.status(500).json({ message: "Errore sconosciuto" });
      }
    }
  }


  async updateUser(req: Request, res: Response, next: NextFunction){
    try {
      await modelUser.updateUser(req, res, next);
    } catch (err) {
      if (err instanceof Error) {
        logger.error(`Errore standard di Js: ${err.message}`);
        res
          .status(500)
          .json({ message: "Errore standard di Js:", errore: err.message });
      } else {
        logger.error("Errore sconosciuto");
        res.status(500).json({ message: "Errore sconosciuto" });
      }
    }

  }


  // delete user
  async deleteUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await modelUser.deleteUser(req, res, next);
    } catch (err) {
      if (err instanceof Error) {
        logger.error(`Errore standard di Js: ${err.message}`);
        res
          .status(500)
          .json({ message: "Errore standard di Js:", errore: err.message });
      } else {
        logger.error("Errore sconosciuto");
        res.status(500).json({ message: "Errore sconosciuto" });
      }
    }
  }
}
