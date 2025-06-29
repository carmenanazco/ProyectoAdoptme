import { expect } from "chai";
import { describe, it } from "mocha";
import supertest from "supertest";
import mongoose, { isValidObjectId } from "mongoose";
import adoptionModel from "../src/dao/models/Adoption.js";
import petModel from "../src/dao/models/Pet.js";
import userModel from "../src/dao/models/User.js";
process.loadEnvFile("./.env")

const UriMongo = process.env.URIMONGO

const requester=supertest("http://localhost:8080")

try {
    await mongoose.connect(UriMongo, {dbName: "Adoptme"})
} catch (error) {
    console.log(`Error al conectar la DB`);
}

describe("Pruebas router Adoptions", function(){
    this.timeout(10_000)

    before(async()=>{
        this.pet={
            name:"test",
            specie:"bear",
            birthDate: "2021-05-04T06:23:24.987+00:00"
        }

        let{body} = await requester.post("/api/pets").send(this.pet)
        this.petMockId = body.payload._id

        this.userMock = {
            first_name: "Juan",
            last_name: "Perez",
            email: "test@test.com",
            password: "123"
        }

        let bodyUser= await requester.post("/api/sessions/register").send(this.userMock)
        this.userMockId= bodyUser.body.payload

        await requester.post(`/api/adoptions/${this.userMockId}/${this.petMockId}`)

        this.adoption = await adoptionModel.findOne({owner: this.userMockId, pet: this.petMockId})

    })

    after(async()=>{
        await adoptionModel.deleteMany({ owner: this.userMockId });        
        await mongoose.connection.collection("pets").deleteMany({name:"test"})
        await mongoose.connection.collection("users").deleteMany({email:"test@test.com"})   
        })

    it("Si ejecuto la ruta /api/adoptions, el server responde con un objeto con la propiedad status con valor success", async()=>{
        let {body} = await requester.get("/api/adoptions")
        expect(body).to.has.property("status").and.to.be.eq("success")
    })

    it("Si ejecuto la ruta /api/adoptions, el server responde con status code 200", async()=>{
            let {status} = await requester.get("/api/adoptions")
            expect(status).to.be.eq(200)
    })

    it("Si ejecuto la ruta /api/adoptions, el server responde con la property payload que es un array", async()=>{
        let {body} = await requester.get("/api/adoptions")
        expect(body).to.has.property("payload")
        expect(Array.isArray(body.payload)).to.be.true    
    })

    it("Si ejecuto la ruta /api/adoptions, el server responde con la property payload que es un array de adopciones", async()=>{
        let {body} = await requester.get("/api/adoptions")

        if(Array.isArray(body.payload) && body.payload.length>0){
            expect(body.payload[0]._id).to.be.ok
            expect(isValidObjectId(body.payload[0]._id)).to.be.true
        }
    })

    it("Si ejecuto la ruta /api/adoptions, el server responde con la property payload que es un array de adopciones", async()=>{
        let {body} = await requester.get("/api/adoptions")

        if(Array.isArray(body.payload) && body.payload.length>0){
            expect(body.payload[0]._id).to.be.ok
            expect(isValidObjectId(body.payload[0]._id)).to.be.true
        }
    })

    
    it("Si ejecuto la ruta /api/adoptions/:aid, donde aid es el id de una adopcion valida,  el server responde con un status code 200", async()=>{
        let {status} = await requester.get(`/api/adoptions/${this.adoption._id}`)
        expect(status).to.be.eq(200)
    })

    it("Si ejecuto la ruta /api/adoptions/:aid, donde aid es el id de una adopcion valida, el server responde con un objeto con la propiedad status con valor success", async()=>{
        let {body} = await requester.get(`/api/adoptions/${this.adoption._id}`)

        expect(body).to.has.property("status").and.to.be.eq("success")
    })

    it("Si ejecuto la ruta /api/adoptions/:aid, donde aid es el id de una adopcion valida, el server responde con un objeto con la propiedad payload", async()=>{
        let {body} = await requester.get(`/api/adoptions/${this.adoption._id}`)

        expect(body).to.has.property("payload")
    })

    it("Si ejecuto la ruta /api/adoptions/:aid, donde aid es el id de una adopcion valida,el server responde con un objeto con la propiedad payload que contiene un objeto adoption", async()=>{
        let {body} = await requester.get(`/api/adoptions/${this.adoption._id}`)

        expect(body.payload._id).to.be.ok
        expect(isValidObjectId(body.payload._id)).to.be.true    
    })

    it("Si ejecuto la ruta /api/adoptions/:aid, donde aid es el id de una adopcion valida,el server responde con un objeto con la propiedad payload que contiene un objeto adoption, donde tiene una propiedad owner que ademas es el id de un usuario", async()=>{
        let {body} = await requester.get(`/api/adoptions/${this.adoption._id}`)

        expect(body.payload.owner).to.be.ok
        expect(isValidObjectId(body.payload.owner)).to.be.true    
    })
    
    it("Si ejecuto la ruta /api/adoptions/:aid, donde aid es el id de una adopcion valida,el server responde con un objeto con la propiedad payload que contiene un objeto adoption, donde tiene una propiedad pet que ademas es el id de una mascota", async()=>{
        let {body} = await requester.get(`/api/adoptions/${this.adoption._id}`)

        expect(body.payload.pet).to.be.ok
        expect(isValidObjectId(body.payload.pet)).to.be.true    
    })

    it("Si ejecuto la ruta /api/adoptions/:aid, con un aid que no existe,  el server responde con un status code 404", async()=>{
        let adoptionMockIdInv= "6840685f00bf51958bebfc31"

        let {status} = await requester.get(`/api/adoptions/${adoptionMockIdInv}`)
        expect(status).to.be.eq(404)
    })

    it("Si ejecuto la ruta /api/adoptions/:aid, con un aid que no existe, el server responde con un objeto con la propiedad status con valor error", async()=>{
        let adoptionMockIdInv= "6840685f00bf51958bebfc31"

        let {body} = await requester.get(`/api/adoptions/${adoptionMockIdInv}`)
        expect(body).to.has.property("status").and.to.be.eq("error")
    })

    it("Si ejecuto la ruta /api/adoptions/:aid, con un aid que no existe, el server responde con un objeto con la propiedad error con valor Adoption not found", async()=>{
        let adoptionMockIdInv= "6840685f00bf51958bebfc31"

        let {body} = await requester.get(`/api/adoptions/${adoptionMockIdInv}`)
        expect(body).to.has.property("error").and.to.be.eq("Adoption not found")
    })

    it("Si ejecuto la ruta /api/adoptions/:aid, con un aid con menos caracteres de lo esperado, el server responde con un status code 500", async()=>{
        let adoptionMockIdInv= "6840685f"

        let {status} = await requester.get(`/api/adoptions/${adoptionMockIdInv}`)
        expect(status).to.be.eq(500)
    })

    it("Si ejecuto la ruta /api/adoptions/:aid, con un aid con un tipo de dato diferente al esperado, el server responde con un status code 500", async()=>{
        let adoptionMockIdInv= {}

        let {status} = await requester.get(`/api/adoptions/${adoptionMockIdInv}`)
        expect(status).to.be.eq(500)
    })

    it("Si ejecuto la ruta /api/adoptions/uid/pid, metodo post, donde uid es el id de un user valido y pid, el de una mascota registrada, me devuelve un objeto con la propiedad status con valor success", async()=>{
        let petMock={
            name:"test",
            specie:"bear",
            birthDate: "2021-05-04T06:23:24.987+00:00"
        }

        let bodypet = await requester.post("/api/pets").send(petMock)
        let petMockId = bodypet.body.payload._id

        let {body} = await requester.post(`/api/adoptions/${this.userMockId}/${petMockId}`)

        expect(body).to.be.property("status").and.to.be.eq("success")
    })

    it("Si ejecuto la ruta /api/adoptions/uid/pid, metodo post, donde uid es el id de un user valido y pid, el de una mascota registrada, el server me devuelve un objeto con la propiedad message con valor Pet adopted", async()=>{
        let petMock={
            name:"test",
            specie:"bear",
            birthDate: "2021-05-04T06:23:24.987+00:00"
        }

        let bodypet = await requester.post("/api/pets").send(petMock)
        let petMockId = bodypet.body.payload._id

        let {body} = await requester.post(`/api/adoptions/${this.userMockId}/${petMockId}`)

        expect(body).to.be.property("message").and.to.be.eq("Pet adopted")
    })

    it("Si ejecuto la ruta /api/adoptions/uid/pid, metodo post, donde uid es el id de un user valido y pid, el de una mascota registrada, el server responde con un status code 200", async()=>{
        let petMock={
            name:"test",
            specie:"bear",
            birthDate: "2021-05-04T06:23:24.987+00:00"
        }

        let bodypet = await requester.post("/api/pets").send(petMock)
        let petMockId = bodypet.body.payload._id

        let {status} = await requester.post(`/api/adoptions/${this.userMockId}/${petMockId}`)

        expect(status).to.be.eq(200)
    })

    it("Si ejecuto la ruta /api/adoptions/uid/pid, metodo post, donde uid es el id de un user valido y pid, el de una mascota registrada, se crea un objeto adoption", async()=>{
        let petMock={
            name:"test",
            specie:"bear",
            birthDate: "2021-05-04T06:23:24.987+00:00"
        }

        let bodypet = await requester.post("/api/pets").send(petMock)
        let petMockId = bodypet.body.payload._id

        let {body} = await requester.post(`/api/adoptions/${this.userMockId}/${petMockId}`)

        let adoptionMock = await adoptionModel.findOne({owner: this.userMockId, pet: petMockId})

        expect(adoptionMock).to.be.property("owner")
        expect(adoptionMock).to.be.property("pet")
    })


    it("Si ejecuto la ruta /api/adoptions/uid/pid, metodo post, donde uid es el id de un user valido y pid, el de una mascota registrada, se graba una adopcion en DB", async()=>{
        let petMock={
            name:"test",
            specie:"bear",
            birthDate: "2021-05-04T06:23:24.987+00:00"
        }

        let bodypet = await requester.post("/api/pets").send(petMock)
        let petMockId = bodypet.body.payload._id

        let {body} = await requester.post(`/api/adoptions/${this.userMockId}/${petMockId}`)

        let adoptionMock = await adoptionModel.findOne({owner: this.userMockId, pet: petMockId})

        expect(adoptionMock).to.be.property("_id")
        expect(isValidObjectId(adoptionMock._id)).to.be.true
    })

    it("Si ejecuto la ruta /api/adoptions/uid/pid, metodo post, donde uid es el id de un user valido y pid, el de una mascota registrada, la propiedad adopted de la mascota cambia a true", async()=>{
        let petMock={
            name:"test",
            specie:"bear",
            birthDate: "2021-05-04T06:23:24.987+00:00"
        }

        let {body} = await requester.post("/api/pets").send(petMock)
        let petMockId = body.payload._id
        let valorDeAdoptedPrevio = body.payload.adopted

        await requester.post(`/api/adoptions/${this.userMockId}/${petMockId}`)
        let petEnDB= await petModel.findById(petMockId)

        expect(petEnDB.adopted).not.to.be.eq(valorDeAdoptedPrevio)
        expect(petEnDB.adopted).to.be.true
    })

    it("Si ejecuto la ruta /api/adoptions/uid/pid, metodo post, donde uid es el id de un user valido y pid, el de una mascota registrada, la propiedad owner de la mascota guarda el id del user", async()=>{
        let petMock={
            name:"test",
            specie:"bear",
            birthDate: "2021-05-04T06:23:24.987+00:00"
        }

        let {body} = await requester.post("/api/pets").send(petMock)
        let petMockId = body.payload._id

        await requester.post(`/api/adoptions/${this.userMockId}/${petMockId}`)
        let petEnDB= await petModel.findById(petMockId)
        expect(petEnDB.owner).to.exist
        expect(isValidObjectId(petEnDB.owner)).to.be.true

        expect(String(petEnDB.owner)).to.be.eq(String(this.userMockId))
    })

    it("Si ejecuto la ruta /api/adoptions/uid/pid, metodo post, donde uid es el id de un user valido y pid, el de una mascota registrada, la propiedad pets del user guarda el id de la mascota", async()=>{
        let petMock={
            name:"test",
            specie:"bear",
            birthDate: "2021-05-04T06:23:24.987+00:00"
        }

        let {body} = await requester.post("/api/pets").send(petMock)
        let petMockId = body.payload._id

        await requester.post(`/api/adoptions/${this.userMockId}/${petMockId}`)

        let userEnDB= await userModel.findById(this.userMockId)
        
        const petIds = userEnDB.pets.map(p => String(p._id));
        expect(petIds).to.include(String(petMockId));
    })

    it("Si ejecuto la ruta /api/adoptions/uid/pid, metodo post, donde uid es el id de un user que no existe, el server responde con un status code 404", async()=>{
        let userMockIdInv= "6840685f00bf51958bebfc31"
        let {status} = await requester.post(`/api/adoptions/${userMockIdInv}/${this.petMockId}`)

        expect(status).to.be.eq(404)
    })

    it("Si ejecuto la ruta /api/adoptions/uid/pid, metodo post, donde uid es el id de un user que no existe, el server responde con un objeto con la propiedad status con valor error", async()=>{
        let userMockIdInv= "6840685f00bf51958bebfc31"
        let {body} = await requester.post(`/api/adoptions/${userMockIdInv}/${this.petMockId}`)

        expect(body).to.has.property("status").and.to.be.eq("error")
    })

    it("Si ejecuto la ruta /api/adoptions/uid/pid, metodo post, donde uid es el id de un user que no existe, el server responde con un objeto con la propiedad error con valor user Not found", async()=>{
        let userMockIdInv= "6840685f00bf51958bebfc31"
        let {body} = await requester.post(`/api/adoptions/${userMockIdInv}/${this.petMockId}`)

        expect(body).to.has.property("error").and.to.be.eq("user Not found")
    })


    it("Si ejecuto la ruta /api/adoptions/uid/pid, metodo post, donde uid es el id de un user existente pero el pid es un id de pet que no existe, el server responde con un status code 404", async()=>{
        let petMockIdInv= "6840685f00bf51958bebfc31"
        let {status} = await requester.post(`/api/adoptions/${this.userMockId}/${petMockIdInv}`)

        expect(status).to.be.eq(404)
    })

    it("Si ejecuto la ruta /api/adoptions/uid/pid, metodo post, donde uid es el id de un user existente pero el pid es un id de pet que no existe, el server responde con un objeto con la propiedad status con valor error", async()=>{
        let petMockIdInv= "6840685f00bf51958bebfc31"
        let {body} = await requester.post(`/api/adoptions/${this.userMockId}/${petMockIdInv}`)

        expect(body).to.has.property("status").and.to.be.eq("error")
    })

    it("Si ejecuto la ruta /api/adoptions/uid/pid, metodo post, donde uid es el id de un user existente pero el pid es un id de pet que no existe, el server responde con un objeto con la propiedad error con valor Pet not found", async()=>{
        let petMockIdInv= "6840685f00bf51958bebfc31"
        let {body} = await requester.post(`/api/adoptions/${this.userMockId}/${petMockIdInv}`)

        expect(body).to.has.property("error").and.to.be.eq("Pet not found")
    })

    it("Si ejecuto la ruta /api/adoptions/uid/pid, metodo post, donde uid es el id de un user valido y pid, el de una mascota registrada, pero la mascota ya fue adoptada, el server responde con un status code 400", async()=>{
        let {status} = await requester.post(`/api/adoptions/${this.userMockId}/${this.petMockId}`)

        expect(status).to.be.eq(400)
    })

    it("Si ejecuto la ruta /api/adoptions/uid/pid, metodo post, donde uid es el id de un user valido y pid, el de una mascota registrada, pero la mascota ya fue adoptada, el server responde con un objeto con la propiedad status con valor error", async()=>{

        let {body} = await requester.post(`/api/adoptions/${this.userMockId}/${this.petMockId}`)

        expect(body).to.has.property("status").and.to.be.eq("error")
    })

    it("Si ejecuto la ruta /api/adoptions/uid/pid, metodo post, ddonde uid es el id de un user valido y pid, el de una mascota registrada, pero la mascota ya fue adoptada, el server responde con un objeto con la propiedad error con valor Pet is already adopted", async()=>{

        let {body} = await requester.post(`/api/adoptions/${this.userMockId}/${this.petMockId}`)

        expect(body).to.has.property("error").and.to.be.eq("Pet is already adopted")
    })

    
    it("Si ejecuto la ruta /api/adoptions/uid/pid, metodo post, con un uid con un tipo de dato diferente al esperado, el server responde con un status code 500", async()=>{
        let userMockIdInv= "a"
        let {status} = await requester.post(`/api/adoptions/${userMockIdInv}/${this.petMockId}`)

        expect(status).to.be.eq(500)
    })

    it("Si ejecuto la ruta /api/adoptions/uid/pid, metodo post, donde uid es el id de un user existente pero el pid es de tipo diferente al esperado, el server responde con un status code 404", async()=>{
        let petMockIdInv= "hola"
        let {status} = await requester.post(`/api/adoptions/${this.userMockId}/${petMockIdInv}`)

        expect(status).to.be.eq(500)
    })
})