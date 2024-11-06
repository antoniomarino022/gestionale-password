"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const logger = (0, winston_1.createLogger)({
    level: 'info', // Livello minimo di log che verrà registrato (può essere 'error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly')
    format: winston_1.format.combine(winston_1.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }), winston_1.format.errors({ stack: true }), // Include lo stack trace degli errori
    winston_1.format.splat(), // Supporta la sostituzione simile a printf
    winston_1.format.json() // Formatta i log come JSON
    ),
    defaultMeta: { service: 'user-service' }, // Meta informazioni comuni in tutti i log
    transports: [
        new winston_1.transports.File({ filename: 'logs/error.log', level: 'error' }), // Log solo errori su 'error.log'
        new winston_1.transports.File({ filename: 'logs/combined.log' }) // Log tutti i messaggi su 'combined.log'
    ]
});
// Se l'applicazione non è in produzione, aggiungi anche un logger che stampa sulla console
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston_1.transports.Console({
        format: winston_1.format.combine(winston_1.format.colorize(), // Colora l'output per renderlo più leggibile in console
        winston_1.format.simple() // Formatta i log in modo semplice
        )
    }));
}
exports.default = logger;
