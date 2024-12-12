import { modelCredenziali } from "../models/ModelCredenziali";
import logger from "../middleware/logger";
import { Request, Response, NextFunction } from "express";


export class ControllerCredenziali{

  // clean table credenziali
  async cleanTableCredenziali(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await modelCredenziali.cleanTableCredenziali(req, res, next);
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


  // registrazione password
    async registerPass(req: Request, res: Response, next: NextFunction): Promise<void>{
        try {
            await modelCredenziali.registerPassword(req,res,next);
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