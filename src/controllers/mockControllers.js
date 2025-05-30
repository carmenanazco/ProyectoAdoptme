import PetDTO from "../dto/Pet.dto.js";
//import { PetsDao } from "../dao/petsMockDao.js"
import { generaPets, generaUser } from "../mocks/petsMock.js";
import { petsService, usersService } from "../services/index.js";
import { createHash } from "../utils/index.js";

export const mockPets= async(req, res)=>{
    let { cantidad=1, db} = req.query
    let pets = []
    for(let i=0; i<cantidad; i++){
        pets.push(generaPets())
    }

    if(db){
        try {
            pets.forEach(async elem => {
                const pet = PetDTO.getPetInputFrom({
                    name: elem.name,
                    specie: elem.specie,
                    birthDate: elem.birthDate,
                    image: elem.image

                });
                await petsService.create(pet);
            });

        } catch (error) {
            return res.status(500).json({error:`error al grabar datos`})
        }
    }
    return res.status(200).json({pets})
}


export const mockUsers = async(req, res)=>{
    let { cantidad =1, db} = req.query
    let users = []
    for(let i=0; i<cantidad; i++){
        const newUser= generaUser()
        newUser.password= await createHash(newUser.password);
        await users.push(newUser)
        //console.log(users);
    }

    if(db){
        try {
            users.forEach(async elem => {
                const user = {
                    first_name:elem.first_name,
                    last_name: elem.last_name,
                    email: elem.email,
                    password: elem.password,
                    role: elem.role
                }
                await usersService.create(user);
            });

        }catch (error) {
            return res.status(500).json({error:`error al grabar datos`})
        }
    return res.status(200).json({users})
    }
}

export const mockData = async(req, res)=>{
    
    const {cantUsers, cantPets}= req.params
    try {
        for(let i=0; i<cantUsers; i++){
            const newUser= generaUser()
            newUser.password= await createHash(newUser.password);
            console.log(newUser);
            await usersService.create(newUser);
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

            await petsService.create(pet);

        }
            return res.status(200).json({status: 'success'})


        }catch (error) {
            return res.status(500).json({error:`error al grabar datos`})
        }
        //res.send({status: 'success'})
    }
            // users.forEach(async elem => {
            //     const user = {
            //         first_name:elem.first_name,
            //         last_name: elem.last_name,
            //         email: elem.email,
            //         password: elem.password,
            //         role: elem.role
            //     }
            // });
