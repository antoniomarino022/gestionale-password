import { modelCredenziali } from "../models/ModelCredenziali";
import logger from "../middleware/logger";
import { Request, Response, NextFunction } from "express";


export class ControllerCredenziali{

    async registerPass(req: Request, res: Response, next: NextFunction): Promise<void>{
        try {
            await modelCredenziali.registerPassword(req,res,next);
            logger.error("Errore nel controller di login");
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

}