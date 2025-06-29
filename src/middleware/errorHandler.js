import fs from 'fs'
import os from 'os'

export const errorHandler=(error, req, res, next)=>{
    console.log(error.message);
    let logFile='./src/logs/error.log'
    let user= os.userInfo().username
    let host= os.hostname()
    if(fs.existsSync(logFile)){
        fs.appendFileSync(logFile, "\n"+JSON.stringify({fecha: new Date(), error: error.message, host, user}))
    }else{
        fs.writeFileSync(logFile, JSON.stringify({fecha: new Date(), error: error.message}))
    }

    res.setHeader('Content-Type', 'application/json');
    //return res.status(404).json({error: `Error inesperado - ingrese una cantidad valida`})
    return res.status(500).json({error:`Error inesperado - reintente en unos minutos o contacte al administrador`})
    
}