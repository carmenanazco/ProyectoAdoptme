import { createHash, passwordValidation } from "../../src/utils/index.js";
import { expect } from "chai";
import { describe, it } from "mocha";

describe("Pruebas funcione de hash", ()=>{
    describe("Pruebas funcion createHash", ()=>{
        it("Si envio una password en texto plano, devuelve algo diferente", async()=>{
            let password="123"
            let resultado= await createHash(password)

            expect(resultado).not.to.be.eq(password)

        })

        it("Si envio una password en texto plano, devuelve algo de mas de 20 caracteres", async()=>{
            let password="123"
            let resultado= await createHash(password)

            expect(resultado.length).to.be.greaterThan(20)
        })

        it("Si envio una password en texto plano, devuelve un hash con codigo bcrypt", async()=>{
            let password="123"
            let resultado= await createHash(password)

            expect(resultado.slice(0,4)).to.be.eq("$2b$")
        })
    })

    describe("Pruebas funcion passwordValidation", ()=>{
        it("Si envio una contraseña diferente a la hasheada, devuelve false", async()=>{
            let password="123"
            let hash = await createHash(password)
            
            let passwordMal = "456"
            let user={
                password: hash
            }
            let resultado = await passwordValidation(user, passwordMal)
            expect(resultado).to.be.false
        })

        it("Si envio una contraseña igual a la hasheada, devuelve true", async()=>{
            let password="123"
            let hash = await createHash(password)
            
            let user={
                password: hash
            }

            let resultado = await passwordValidation(user, password)
            expect(resultado).to.be.true
        })
    })
})