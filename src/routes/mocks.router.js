import { Router } from "express";
import { mockData, mockPets, mockUsers } from "../controllers/mockControllers.js";

const router = Router();

router.get('/mockingpets', mockPets)

router.get('/mockingusers', mockUsers)
router.post('/generateData/:cantUsers/:cantPets', mockData)

/**
Además, generar un customizador de errores y crear un diccionario para tus errores más comunes al registrar un usuario, crear una mascota, etc.
 * 


Dentro del router mocks.router.js, desarrollar un endpoint POST llamado /generateData 
que reciba los parámetros numéricos “users” y “pets” para generar e insertar en la base de datos la cantidad de registros indicados.
Comprobar dichos registros insertados mediante los servicios GET de users y pets
 * 
 */

export default router
