import winston from 'winston'

const logger = winston.createLogger({

    transports:[
        new winston.transports.Console(
            {
                level:"http",
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.colorize(),
                    winston.format.simple()
                )
            }
        ),
            new winston.transports.File(
            {
                level:"warn", 
                filename: "./src/logs/error.log",
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.json()
                )
            }
        ),
    ]
})

export const addLogger = (req, res, next)=>{
    req.logger = logger;
    //req.logger.http(`${req.method} en ${req.url} - ${new Date().toLocaleTimeString}`)
    next()
}