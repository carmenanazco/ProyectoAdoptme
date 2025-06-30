import { expect } from "chai";
import { describe, it } from "mocha";
import supertest from "supertest";
import mongoose, { isValidObjectId } from "mongoose";
import dotenv from 'dotenv'
dotenv.config()

const UriMongo = process.env.URIMONGO

const requester=supertest("http://localhost:8080")

try {
    await mongoose.connect(UriMongo, {dbName: "Adoptme"})
} catch (error) {
    console.log(`Error al conectar la DB`);
}

describe("Pruebas router Users", function(){
    this.timeout(10_000)

    before(async()=>{
            this.userMock = {
            first_name: "Juan",
            last_name: "Perez",
            email: "test@test.com",
            password: "123"
        }

        let {body}= await requester.post("/api/sessions/register").send(this.userMock)
        this.userMockId= body.payload
        })
    
        after(async()=>{
            await mongoose.connection.collection("users").deleteMany({email:"test@test.com"})
        })

        let userUpdate={
            first_name: "Juan test",
            last_name: "Perez",
            email: "test@test.com",
            password: "123",
            pets: []
        }

    it("Si ejecuto la ruta /api/users, el server responde con un objeto con la propiedad status con valor success", async()=>{
        let {body}= await requester.get("/api/users")
        expect(body).to.has.property("status").and.to.be.eq("success")
    })

    it("Si ejecuto la ruta /api/users, el server responde con un status code 200", async()=>{
        let {status}= await requester.get("/api/users")
        expect(status).to.be.eq(200)

    })

    it("Si ejecuto la ruta /api/users, el server responde con un objeto con la propiedad payload que es un array", async()=>{
        let {body}= await requester.get("/api/users")
        expect(body).to.has.property("payload")
        expect(Array.isArray(body.payload)).to.be.true

    })

    it("Si ejecuto la ruta api/users, el server responde con la property payload que es un array de users", async()=>{
        let {body}= await requester.get("/api/users")
        if(Array.isArray(body.payload)&& body.payload.length>0){
            expect(body.payload[0]._id).to.be.ok
            expect(isValidObjectId(body.payload[0]._id)).to.be.true
        }
    })

    it("Si ejecuto la ruta /api/users/:uid, donde uid es el id de un user registrado, el server responde con un objeto con la propiedad status con valor success", async()=>{        
        let {body}= await requester.get(`/api/users/${this.userMockId}`)
        
        expect(body).to.has.property("status").and.to.be.eq("success")
    })

    it("Si ejecuto la ruta /api/users/:uid, donde uid es el id de un user registrado, el server responde con un status code 200", async()=>{
        let {status}= await requester.get(`/api/users/${this.userMockId}`)
        
        expect(status).to.be.eq(200)
    })

    it("Si ejecuto la ruta /api/users/:uid, donde uid es el id de un user registrado, el server responde con un objeto con la propiedad payload", async()=>{
        let {body}= await requester.get(`/api/users/${this.userMockId}`)
        
        expect(body).to.has.property("payload")
    })

    it("Si ejecuto la ruta /api/users/:uid, donde uid es el id de un user registrado, el server responde con un objeto con la propiedad payload que contiene un objeto user", async()=>{
        let {body}= await requester.get(`/api/users/${this.userMockId}`)
        
        expect(body.payload._id).to.be.ok
        expect(isValidObjectId(body.payload._id)).to.be.true
    })

    it("Si ejecuto la ruta /api/users/:uid, donde uid es el id de un user registrado, el server responde con un objeto con la propiedad payload donde el _id coincide con el uid", async()=>{
        let {body}= await requester.get(`/api/users/${this.userMockId}`)
        
        expect(body.payload._id).to.be.eq(this.userMockId)
    })

    it("Si ejecuto la ruta /api/users/:uid, con un uid invalido, el server responde con un status code 404", async()=>{
        let userMockIdInv= "6840685f00bf51958bebfc31"
        let {status}= await requester.get(`/api/users/${userMockIdInv}`)
        
        expect(status).to.be.eq(404)
    })

    it("Si ejecuto la ruta /api/users/:uid, con un uid incorrecto, el server responde con un objeto con la propiedad status con valor error", async()=>{
        let userMockIdInv= "6840685f00bf51958bebfc31"
        let {body}= await requester.get(`/api/users/${userMockIdInv}`)
        
        expect(body).to.has.property("status").and.to.be.eq("error")
    })

    it("Si ejecuto la ruta /api/users/:uid, con un uid invalido, el server responde con un objeto con la propiedad error con valor User not found", async()=>{
        let userMockIdInv= "6840685f00bf51958bebfc31"
        let {body}= await requester.get(`/api/users/${userMockIdInv}`)
        
        expect(body).to.has.property("error").and.to.be.eq("User not found")
    })

    it("Si ejecuto la ruta /api/users/:uid, con un uid con menos caracteres de lo esperado, el server responde con un status code 500", async()=>{
        let userMockIdInv= "6840685f01"
        let {status}= await requester.get(`/api/users/${userMockIdInv}`)
        
        expect(status).to.be.eq(500)
    })

    it("Si ejecuto la ruta /api/users/:uid, con un uid con un tipo de dato diferente al esperado, el server responde con un status code 500", async()=>{
        let userMockIdInv= {}
        let {status}= await requester.get(`/api/users/${userMockIdInv}`)
        
        expect(status).to.be.eq(500)
    })

    it("Si realizo un put a /api/users/:uid, donde uid es el id de un user registrado, y envio por req los datos a modificar del user, el server responde con un objeto con la propiedad status con valor success", async()=>{
        let {body}= await requester.put(`/api/users/${this.userMockId}`).send(userUpdate)
        
        expect(body).to.has.property("status").and.to.be.eq("success")
    })

    it("Si realizo un put a /api/users/:uid, donde uid es el id de un user registrado, y envio por req los datos a modificar del user, el server responde con un objeto con la propiedad message con valor User updated", async()=>{
        let {body}= await requester.put(`/api/users/${this.userMockId}`).send(userUpdate)
        
        expect(body).to.has.property("message").and.to.be.eq("User updated")
    })
    
    it("Si realizo un put a /api/users/:uid, donde uid es el id de un user registrado, y envio por req los datos a modificar del user, el server responde con un status code 200", async()=>{
        let {status}= await requester.put(`/api/users/${this.userMockId}`).send(userUpdate)
    
        expect(status).to.be.eq(200)
    })

    it("Si realizo un put a /api/users/:uid, donde uid es el id de un user registrado, y envio por req los datos a modificar, el server modifica el user, por ejemplo el nombre", async()=>{
        let userUpdatep = {
            first_name: 'Juan test',
        }

        await requester.put(`/api/users/${this.userMockId}`).send(userUpdatep)

        let {body}= await requester.get(`/api/users/${this.userMockId}`)
        
        expect(body.payload.first_name).to.be.eq(body.payload.first_name)
    })

    it("Si realizo un put a /api/users/:uid, donde uid es un id de un user que no existe, el server responde con un status code 404", async()=>{

        let userMockIdInv= "6840685f00bf51958bebfc31"

            let {status}= await requester.put(`/api/users/${userMockIdInv}`).send(userUpdate)
            
            expect(status).to.be.eq(404)
    })

    it("Si realizo un put a /api/users/:uid, donde uid es un id de un user que no existe, el server responde con un objeto con la propiedad status con valor error", async()=>{
        let userMockIdInv= "6840685f00bf51958bebfc31"

        let {body}= await requester.put(`/api/users/${userMockIdInv}`).send(userUpdate)
        
        expect(body).to.has.property("status").and.to.be.eq("error")
    })

    it("Si realizo un put a /api/users/:uid, donde uid es un id de un user que no existe, el server responde con un objeto con la propiedad error con valor User not found", async()=>{
        let userMockIdInv= "6840685f00bf51958bebfc31"
        let {body}= await requester.put(`/api/users/${userMockIdInv}`).send(userUpdate)
        
        expect(body).to.has.property("error").and.to.be.eq("User not found")
    })

        it("Si realizo un put a /api/users/:uid, con un uid con un tipo de dato diferente al esperado, el server responde con un status code 500", async()=>{
        let userMockIdInv= "a"
        let {status}= await requester.put(`/api/users/${userMockIdInv}`).send(userUpdate)
        
        expect(status).to.be.eq(500)
    })

    it("Si realizo un delete a /api/users/:uid, donde uid es el id de un user registrado, el server elimina el usuario y responde de manera positiva", async ()=>{
        let {body, status}= await requester.delete(`/api/users/${this.userMockId}`)
        expect(body).to.has.property("status").and.to.be.eq("success")
        expect(body).to.has.property("message").and.to.be.eq("User deleted")        
        expect(status).to.be.eq(200)

        let getRes= await requester.get(`/api/users/${this.userMockId}`)
        expect(getRes.status).to.equal(404);
    })

    it("Si realizo un delete a /api/users/:uid, donde uid es el id de un user que no existe, el server responde con un status code 404", async()=>{
    let {status}= await requester.delete(`/api/users/${this.userMockId}`)
    
    expect(status).to.be.eq(404)
    })

    it("Si realizo un delete a /api/users/:uid, donde uid es el id de un user que no existe, el server responde con un objeto con la propiedad status con valor error", async()=>{
    let {body}= await requester.delete(`/api/users/${this.userMockId}`)
    
    expect(body).to.has.property("status").and.to.be.eq("error")
    })

    it("Si realizo un delete a /api/users/:uid, donde uid es el id de un user que no existe, el server responde con un objeto con la propiedad error con valor User not found", async()=>{
        let {body}= await requester.delete(`/api/users/${this.userMockId}`)
        
        expect(body).to.has.property("error").and.to.be.eq("User not found")
    })

    it("Si realizo un delete a /api/users/:uid, con un uid con menos caracteres de lo esperado, el server responde con un status code 500", async()=>{
        let userMockIdInv= "6840685f01"
        let {status}= await requester.delete(`/api/users/${userMockIdInv}`)
        expect(status).to.be.eq(500)
    })

    it("Si realizo un delete a /api/users/:uid, con un tipo de dato diferente al esperado, el server responde con un status code 500", async()=>{
        let userMockIdInv= "[]"
        let {status}= await requester.delete(`/api/users/${userMockIdInv}`)
        expect(status).to.be.eq(500)
    })
    
})

