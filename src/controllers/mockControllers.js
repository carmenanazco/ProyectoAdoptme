import PetDTO from "../dto/Pet.dto.js";
import { generaPets, generaUser } from "../mocks/mocks.js";
import { petsService, usersService } from "../services/index.js";
import { createHash } from "../utils/index.js";
import { addLogger } from "../utils/logger.js";

export const mockPets= async(req, res, next)=>{
    try {
        //req.logger.warn('Alerta');
        
        //res.send({message: "Prueba de logger"})

        let { cantidad=1 } = req.query
        const nCantidad = Number(cantidad)
        if (!Number.isInteger(nCantidad) || nCantidad<=0){
            throw new Error("La cantidad no es valida")
        }
        const pets = []

        for(let i=0; i<cantidad; i++){
            const newPet = generaPets()
            const pet = PetDTO.getPetInputFrom({
                name: newPet.name,
                specie: newPet.specie,
                birthDate: newPet.birthDate,
                image: newPet.image
                });
            pets.push(pet)
        }
        return res.status(200).json(pets)

    } catch (error) {
        next(error)
    }
}

export const mockUsers = async(req, res, next)=>{
    try {
        let { cantidad=1 } = req.query
        const nCantidad = Number(cantidad)       
        if (!Number.isInteger(nCantidad) || nCantidad<=0){
            throw new Error("La cantidad no es valida")
        }
        const users =[]

        for(let i=0; i<cantidad; i++){
            const user= generaUser()
            user.password= await createHash(user.password);
            users.push(user)
        }
        return res.status(200).json(users)
        }catch (error) { 
            next(error)       
        }
    }


export const mockData = async(req, res, next)=>{
    try {        
        const {user, pet}= req.query
        console.log(user,pet)
        const cantidadUser = Number(user)
        const cantidadPet = Number(pet)
        
        if (!Number.isInteger(cantidadUser) || !Number.isInteger(cantidadPet) || cantidadPet<=0 || cantidadUser<=0){
            throw new Error("La cantidad no es valida")
        }

        const users = []
        const pets = []
        for(let i=0; i<cantidadUser; i++){
            const newUser= generaUser()
            newUser.password= await createHash(newUser.password);
            let user = await usersService.create(newUser);
            users.push(user)
        }

        for(let i=0; i<cantidadPet; i++){
            let newPet = generaPets()
            const pet = PetDTO.getPetInputFrom({
                name: newPet.name,
                specie: newPet.specie,
                birthDate: newPet.birthDate,
                image: newPet.image
            });
            console.log(pet);
            let petSave =await petsService.create(pet);
            pets.push(petSave)
        }
        return res.status(200).json({users, pets})
        }catch (error) {
            next(error)
        }
    }
