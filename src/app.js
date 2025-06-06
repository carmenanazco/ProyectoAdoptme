import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv'

import usersRouter from './routes/users.router.js';
import petsRouter from './routes/pets.router.js';
import adoptionsRouter from './routes/adoption.router.js';
import sessionsRouter from './routes/sessions.router.js';
import mocksRouter from './routes/mocks.router.js'
import { errorHandler } from './middleware/errorHandler.js';
import { addLogger } from './utils/logger.js';
process.loadEnvFile("./.env")


const app = express();
dotenv.config()

const UriMongo = process.env.URIMONGO
const PORT = process.env.PORT||8080;

app.use(addLogger)

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

const connection = async() =>{
    await mongoose.connect(UriMongo, {dbName: "Adoptme"})
    .then(()=> console.log("Conexion a base de datos exitosa"))
    .catch((error)=> {
        console.error("Error en conexion: ", error)
        process.exit();
    })
}

connection()

app.use('/api/users',usersRouter);
app.use('/api/pets',petsRouter);
app.use('/api/adoptions',adoptionsRouter);
app.use('/api/sessions',sessionsRouter);
app.use('/api/mocks', mocksRouter);

app.use(errorHandler)
app.listen(PORT,()=>console.log(`Listening on ${PORT}`))

