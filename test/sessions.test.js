import { expect } from "chai";
import { describe, it } from "mocha";
import supertest from "supertest";
import mongoose, { isValidObjectId } from "mongoose";
process.loadEnvFile("./.env")

const UriMongo = process.env.URIMONGO

const requester=supertest("http://localhost:8080")

try {
    await mongoose.connect(UriMongo, {dbName: "Adoptme"})
} catch (error) {
    console.log(`Error al conectar la DB`);
}

describe("Pruebas router sessions", function(){
    this.timeout(10_000)

    after(async()=>{
        await mongoose.connection.collection("users").deleteMany({email: "test@test.com"})
    })

    let cookie
    let cookieUnProtect

    let userMock = {
            first_name: "Juan",
            last_name: "Perez",
            email: "test@test.com",
            password: "123"
        }

    it("Si realizo un post a /api/sessions/register con datos validos, genera un usuario en DB", async()=>{

        let {body} = await requester.post("/api/sessions/register").send(userMock)
        expect(body).to.has.property("status").and.to.be.eq("success")
        expect(body.payload).to.be.ok
        expect(isValidObjectId(body.payload)).to.be.true
    })

    it("Si realizo un post a /api/sessions/register con datos invalidos, devuelve un status code 400", async()=>{
        let userMockInv = {
            last_name: "Perez",
            email: "test@test.com",
            password: "123"
        }

        let {statusCode} = await requester.post("/api/sessions/register").send(userMockInv)
        expect(statusCode).to.be.eq(400)
    })

    it("Si realizo un post a /api/sessions/login con datos de un usuario previamente registrado, devuelve un mensaje y estado", async()=>{
        let userMock = {
            email: "test@test.com",
            password: "123"
        }

        let {body} = await requester.post("/api/sessions/login").send(userMock)        
        expect(body).to.has.property("status").and.to.be.eq("success")
        expect(body).to.has.property("message").and.to.be.eq("Logged in")       
    })

    it("Si realizo un post a /api/sessions/login con datos de un usuario previamente registrado, devuelve una cookie de nombre codercookie", async()=>{
        let userMock = {
            email: "test@test.com",
            password: "123"
        }

        let {headers} = await requester.post("/api/sessions/login").send(userMock)

        cookie=headers["set-cookie"]
        let nombreCookie=cookie[0]
        nombreCookie=nombreCookie.split("=")[0]

        expect(nombreCookie).to.be.eq("coderCookie")
    })

    it("Si hago un get a /api/sessions/current, enviando una cookie obtenida en el login, retorna los datos del usuario logueado", async()=>{
        let {body} = await requester.get("/api/sessions/current").set("Cookie", cookie)

        expect(body).to.have.property("status").and.to.be.eq("success")
        expect(body.payload).to.have.property("email").and.to.be.eq(userMock.email)
    })

    it("Si realizo un post a /api/sessions/unprotectedLogin con datos de un usuario previamente registrado, devuelve un mensaje y estado", async()=>{
        let userMock = {
            email: "test@test.com",
            password: "123"
        }

        let {body} = await requester.post("/api/sessions/unprotectedLogin").send(userMock)        
        expect(body).to.has.property("status").and.to.be.eq("success")
        expect(body).to.has.property("message").and.to.be.eq("Unprotected Logged in")       
    })

    it("Si realizo un post a /api/sessions/unprotectedLogin con datos de un usuario previamente registrado, devuelve una cookie de nombre unprotectedCookie", async()=>{
        let userMock = {
            email: "test@test.com",
            password: "123"
        }

        let {headers} = await requester.post("/api/sessions/unprotectedLogin").send(userMock)

        cookieUnProtect=headers["set-cookie"]        
        let nombreCookie=cookieUnProtect[0]
        nombreCookie=nombreCookie.split("=")[0]
        expect(nombreCookie).to.be.eq("unprotectedCookie")
    })

    it("Si hago un get a /api/sessions/unprotectedCurrent, enviando una cookie obtenida en el login, retorna los datos del usuario logueado", async()=>{
        let {body} = await requester.get("/api/sessions/unprotectedCurrent").set("Cookie", cookieUnProtect)

        expect(body).to.have.property("status").and.to.be.eq("success")
        expect(body.payload).to.have.property("email").and.to.be.eq(userMock.email)
        expect(body.payload).to.have.property("first_name").and.to.be.eq(userMock.first_name)

    })

})