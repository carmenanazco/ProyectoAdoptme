import UserDTO from "../../src/dto/User.dto.js";
import { describe, it } from "mocha";
import { expect } from "chai";
import dotenv from 'dotenv'
dotenv.config()

describe("Pruebas Users DTO", ()=>{

    let userMock={
        first_name: "Juan",
        last_name: "Roldan",
        email: "jroldan@test.com",
        password: "123",
        role: "admin"
    }
    it("Si envio un usuario al DTO con first_name y last_name, retorna name, con la concatenacion de ambos", ()=>{
        let resultado=UserDTO.getUserTokenFrom(userMock)

        expect(resultado).to.has.property("name").and.to.be.eq(`${userMock.first_name} ${userMock.last_name}`)
        expect(resultado.name).to.be.equal(`${userMock.first_name} ${userMock.last_name}`)
    })

    it("Si envio un usuario al DTO, retorna una prop email", ()=>{
        let resultado=UserDTO.getUserTokenFrom(userMock)

        expect(resultado).to.has.property("email")
    })
    
    it("Si envio un usuario al DTO, retorna una prop role", ()=>{
        let resultado=UserDTO.getUserTokenFrom(userMock)

        expect(resultado).to.has.property("role")
        expect(resultado.role).to.exist
        expect(resultado.role).to.be.ok
    })

    it("Si envio un usuario al DTO sin role, retorna una prop role con valor undefined", ()=>{
        delete userMock.role
        let resultado=UserDTO.getUserTokenFrom(userMock)

        expect(resultado.role).to.be.undefined
    })
})