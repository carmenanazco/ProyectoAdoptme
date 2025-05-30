import { fakerES_MX as fa } from "@faker-js/faker"

export const generaPets=()=>{
    let name = fa.animal.petName()
    let specie = fa.animal.type()
    let birthDate= fa.date.birthdate({mode: 'age', min:0, max: 25})    
    let image = fa.image.urlLoremFlickr({category: specie})

    return{
        name, specie, birthDate, image
    }
}

//console.log(generaPets());

export const generaUser=()=>{

    let first_name = fa.person.firstName()
    let last_name = fa.person.lastName()
    let email= fa.internet.email({firstName:first_name, lastName:last_name})
    let password= 'coder123'    
    let role= fa.helpers.arrayElement(['user', 'admin'])
        
    return{
        first_name, last_name, email, password, role
    }
}

//console.log(generaUser());

