import PetDTO from "../dto/Pet.dto.js";
import { generaPets, generaUser } from "../mocks/mocks.js";
import { petsService, usersService } from "../services/index.js";
import { createHash } from "../utils/index.js";
import { addLogger } from "../utils/logger.js";

export const mockPets= async(req, res, next)=>{
    try {
        req.logger.warn('Alerta');
        
        res.send({message: "Prueba de logger"})

        let { cantidad=1 } = req.query
        const nCantidad = Number(cantidad)
        if (isNaN(nCantidad) || !Number.isInteger(nCantidad) || nCantidad<=0){
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
            console.log(pet);
        }
        return res.status(200).json(pets)

    } catch (error) {
        next(error)
        //return res.status(500).json({error:`error al crear pets datos`})
    }
}

export const mockUsers = async(req, res)=>{
    try {
        let { cantidad=1 } = req.query
        const nCantidad = Number(cantidad)
       
        if (isNaN(nCantidad) || !Number.isInteger(nCantidad) || nCantidad<=0){
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
            //return res.status(500).json({error:`error al grabar datos`})
        }
    }


export const mockData = async(req, res)=>{
    try {        
        const {user, pet}= req.query
        const cantidadUser = Number(user)
        const cantidadPet = Number(pet)
        
        if (isNaN(cantidadUser) || isNaN(cantidadPet)|| !Number.isInteger(cantidadUser) || !Number.isInteger(cantidadPet) || cantidadPet<=0 || cantidadUser<=0){
            throw new Error("La cantidad no es valida")
        }

        const users = []
        const pets = []
        for(let i=0; i<cantUsers; i++){
            const newUser= generaUser()
            newUser.password= await createHash(newUser.password);
            let user = await usersService.create(newUser);
            users.push(user)
        }

        for(let i=0; i<cantPets; i++){
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
           // return res.status(500).json({error:`error al grabar datos`})
        }
    }
