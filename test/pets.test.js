import { expect } from "chai";
import { describe, it } from "mocha";
import supertest from "supertest";
import mongoose, { isValidObjectId } from "mongoose";
import { petsService } from "../src/services/index.js";
import fs from "fs"
process.loadEnvFile("./.env")

const UriMongo = process.env.URIMONGO

const requester=supertest("http://localhost:8080")

try {
    await mongoose.connect(UriMongo, {dbName: "Adoptme"})
} catch (error) {
    console.log(`Error al conectar la DB`);
}

describe("Pruebas router Mascotas", function(){
    this.timeout(10_000)

    before(async()=>{
        this.pet={
            name:"test",
            specie:"bear",
            birthDate: "2021-05-04T06:23:24.987+00:00"
        }

        let{body} = await requester.post("/api/pets").send(this.pet)
        this.petMock=body.payload
        this.petMockId = body.payload._id
    })

    after(async()=>{
        await mongoose.connection.collection("pets").deleteMany({name:"test"})
        })

    let petMockUpdate={
        name:"test",
        specie:"cat",
        birthDate: "2021-05-04T06:23:24.987+00:00"
    }


    it("Si ejecuto la ruta /api/pets, el server responde con un objeto con la propiedad status con valor success", async()=>{
        let {body} = await requester.get("/api/pets")
        expect(body).to.has.property("status").and.to.be.eq("success")
    })

    it("Si ejecuto la ruta /api/pets, el server responde con status code 200", async()=>{
        let {status} = await requester.get("/api/pets")
        expect(status).to.be.eq(200)
    })

    it("Si ejecuto la ruta /api/pets, el server responde con la property payload que es un array", async()=>{
        let {body} = await requester.get("/api/pets")
        expect(body).to.has.property("payload")
        expect(Array.isArray(body.payload)).to.be.true
    })

    it("Si ejecuto la ruta /api/pets, el server responde con la property payload que es un array de mascotas", async()=>{
        let {body} = await requester.get("/api/pets")

        if(Array.isArray(body.payload) && body.payload.length>0){
            expect(body.payload[0]._id).to.be.ok
            expect(isValidObjectId(body.payload[0]._id)).to.be.true
        }
    })

    it("Si envio datos validos de una mascota con metodo post a /api/pets, me devuelve un objeto con la propiedad status con valor success", async()=>{
        let {body} = await requester.post("/api/pets").send(this.petMock)
        expect(body).to.be.property("status").and.to.be.eq("success")
    })

    it("Si envio datos validos de una mascota con metodo post a /api/pets, me devuelve un objeto con la propiedad payload", async()=>{
        let {body} = await requester.post("/api/pets").send(this.petMock)
        expect(body).to.be.property("payload")

    })


    it("Si envio datos validos de una mascota con metodo post a /api/pets, el server responde con un status code 200", async()=>{
        let {status} = await requester.post("/api/pets").send(this.petMock)
        expect(status).to.be.eq(200)
    })

    it("Si envio datos validos de una mascota con metodo post a /api/pets, el server responde con un objeto con la propiedad payload que contiene un objeto pet", async()=>{
        let {body} = await requester.post("/api/pets").send(this.petMock)
        expect(body.payload).to.be.property("name").and.to.be.eq(this.petMock.name)
        expect(body.payload).to.be.property("specie").and.to.be.eq(this.petMock.specie)
    })

    it("Si envio datos de una mascota validos, a /api/pets, metodo Post, graba la mascota en DB", async()=>{
        let {body} = await requester.post("/api/pets").send(this.petMock)        
        expect(body.payload).to.be.property("_id")
        expect(isValidObjectId(body.payload._id)).to.be.true
    })

    it("Si envio datos validos de una mascota con metodo post a /api/pets, el server responde con la mascota creada que contiene la propiedad adopted en false", async()=>{
        let {body} = await requester.post("/api/pets").send(this.petMock)
        expect(body.payload).to.be.property("adopted").and.to.be.false
    })

    it("Si envio datos de una mascota invalidos a /api/pets, metodo Post, el server responde con un status code 400", async()=>{
        let petMock={
            specie:"dog", birthDate:"2019-02-12"
        }

        let {statusCode} = await requester.post("/api/pets").send(petMock)
        expect(statusCode).to.be.eq(400)
    })

    it("Si envio datos de una mascota invalidos a /api/pets, metodo Post, el server responde con un objeto con la propiedad status con valor error", async()=>{
        let petMock={
            specie:"dog", birthDate:"2019-02-12"
        }

        let {body} = await requester.post("/api/pets").send(petMock)
        expect(body).to.has.property("status").and.to.be.eq("error")
    })

    it("Si envio datos de una mascota invalidos a /api/pets, metodo Post, el server responde con un objeto con la propiedad error con valor Incomplete values", async()=>{
        let petMock={
            specie:"dog", birthDate:"2019-02-12"
        }

        let {body} = await requester.post("/api/pets").send(petMock)
        expect(body).to.has.property("error").and.to.be.eq("Incomplete values")
    })

    it("Si ejecuto un post a /api/pets/withImage con una imagen, la sube al server", async()=>{
        let petMock={
            name:"test",
            specie: "rabbit",
            birthDate: "2019-02-12"
        }

        let {body}= await requester.post("/api/pets/withImage")
            .field("name", petMock.name)
            .field("specie", petMock.specie)
            .field("birthDate", petMock.birthDate)
            .attach("image", "img.jpg")

        expect(body.payload._id).to.exist
        expect(isValidObjectId(body.payload._id)).to.be.true
        expect(body.payload.image).to.exist
        expect(fs.existsSync(body.payload.image)).to.be.true
        fs.unlinkSync(body.payload.image)
    })

    it("Si realizo un put a /api/pets/:pid, donde pid es el id de una mascota registrada, y envio por req los datos a modificar, el server responde con un objeto con la propiedad status con valor success", async()=>{
        let {body}= await requester.put(`/api/pets/${this.petMockId}`).send(petMockUpdate)
        expect(body).to.has.property("status").and.to.be.eq("success")
    })

    it("Si realizo un put a /api/pets/:pid, donde pid es el id de una mascota registrada, y envio por req los datos a modificar, el server responde con un objeto con la propiedad message con valor pet updated", async()=>{
        let {body}= await requester.put(`/api/pets/${this.petMockId}`).send(petMockUpdate)
        expect(body).to.has.property("message").and.to.be.eq("pet updated")
    })

    it("Si realizo un put a /api/pets/:pid, donde pid es el id de una mascota registrada, y envio por req los datos a modificar, el server responde con un status code 200", async()=>{
        let {status}= await requester.put(`/api/pets/${this.petMockId}`).send(petMockUpdate)
        expect(status).to.be.eq(200)
    })

    it("Si realizo un put a /api/pets/:pid, donde pid es el id de una mascota registrada, y envio por req los datos a modificar, el server modifica los datos", async()=>{
        let petOriginal=this.petMock
        let {body}= await requester.put(`/api/pets/${this.petMockId}`).send(petMockUpdate)

        const petEnDB = await petsService.getBy({_id:this.petMockId});
        expect(petOriginal.specie).not.to.be.eq(petEnDB.specie)
        expect(petEnDB.specie).to.be.eq(petMockUpdate.specie)
    })

    it("Si realizo un put a /api/pets/:pid, donde pid es el id de una mascota que no existe, me devuelve un status code 404", async()=>{
        let petMockInv="6840638e7ed0050d843b1f51"
        let {status}= await requester.put(`/api/pets/${petMockInv}`).send(petMockUpdate)
        expect(status).to.be.eq(404)
    })

    it("Si realizo un put a /api/pets/:pid, donde pid es el id de una mascota que no existe, el server responde con un objeto con la propiedad status con valor error", async()=>{
        let petMockInv="6840638e7ed0050d843b1f51"
        let {body}= await requester.put(`/api/pets/${petMockInv}`).send(petMockUpdate)
        expect(body).to.has.property("status").and.to.be.eq("error")    
    })

    it("Si realizo un put a /api/pets/:pid, donde pid es el id de una mascota que no existe, el server responde con un objeto con la propiedad error con valor Pet not found", async()=>{
        let petMockInv="6840638e7ed0050d843b1f51"
        let {body}= await requester.put(`/api/pets/${petMockInv}`).send(petMockUpdate)
        expect(body).to.has.property("error").and.to.be.eq("Pet not found")    
    })

    it("Si realizo un put a /api/pets/:pid, con un pid con menos caracteres de lo esperado, el server responde con un status code 500", async()=>{
        let petMockInv="6840685f01"
        let {status}= await requester.put(`/api/pets/${petMockInv}`).send(petMockUpdate)
        expect(status).to.be.eq(500)
    })

    it("Si realizo un put a /api/pets/:pid, con un tipo de dato diferente al esperado, el server responde con un status code 500", async()=>{
        let petMockInv="[]"
        let {status}= await requester.put(`/api/pets/${petMockInv}`).send(petMockUpdate)
        expect(status).to.be.eq(500)
    })

    it("Si realizo un delete a /api/pets/:pid, donde pid es el id de un pet registrado, el server responde con un objeto con la propiedad status con valor success", async ()=>{
        let {body}= await requester.delete(`/api/pets/${this.petMockId}`)
        expect(body).to.has.property("status").and.to.be.eq("success")
        })

    it("Si realizo un delete a /api/pets/:pid, donde pid es el id de un pet registrado, el server responde con un objeto con la propiedad message con valor pet deleted", async ()=>{
        let bodypet = await requester.post("/api/pets").send(this.pet)
        let {body}= await requester.delete(`/api/pets/${bodypet.body.payload._id}`)
        expect(body).to.has.property("message").and.to.be.eq("pet deleted")        
    })

    it("Si realizo un delete a /api/pets/:pid, donde pid es el id de un pet registrado, el server responde con un status code 200", async ()=>{
        let bodypet = await requester.post("/api/pets").send(this.pet)
        let {status}= await requester.delete(`/api/pets/${bodypet.body.payload._id}`)
        expect(status).to.be.eq(200)

    })

    it("Si realizo un delete a /api/pets/:pid, donde pid es el id de un pet registrado, el server elimina a la mascota", async ()=>{
        let bodypet = await requester.post("/api/pets").send(this.pet)
        let {body}= await requester.delete(`/api/pets/${bodypet.body.payload._id}`)

        const petEnDB= await mongoose.connection.collection("pets").findOne({_id:bodypet.body.payload._id})
        expect(petEnDB).to.be.eq(null);
    })

    it("Si realizo un delete a /api/pets/:pid, donde pid es el id de un pet que no existe, el server responde con un status code 404", async ()=>{
        let {status}= await requester.delete(`/api/pets/${this.petMockId}`)

        expect(status).to.be.eq(404);
    })

    it("Si realizo un delete a /api/pets/:pid, donde pid es el id de un pet que no existe, el server responde con un objeto con la propiedad status con valor error", async ()=>{
        let {body}= await requester.delete(`/api/pets/${this.petMockId}`)

        expect(body).to.has.property("status").and.to.be.eq("error")    
    })

    it("Si realizo un delete a /api/pets/:pid, donde pid es el id de un pet que no existe, el server responde con un objeto con la propiedad error con valor Pet not found", async ()=>{
        let {body}= await requester.delete(`/api/pets/${this.petMockId}`)

        expect(body).to.has.property("error").and.to.be.eq("Pet not found")    
    })

    it("Si realizo un delete a /api/pets/:pid, con un pid con menos caracteres de lo esperado, el server responde con un status code 500", async ()=>{
        let petMockIdInv= "6840685f01"
        let {status}= await requester.delete(`/api/pets/${petMockIdInv}`)
        expect(status).to.be.eq(500)
    })

    it("Si realizo un delete a /api/pets/:pid, con un tipo de dato diferente al esperado, el server responde con un status code 500", async ()=>{
        let petMockIdInv= false
        let {status}= await requester.delete(`/api/pets/${petMockIdInv}`)
        expect(status).to.be.eq(500)
    })

})