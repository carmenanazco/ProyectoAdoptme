import Users from "../../src/dao/Users.dao.js";
import mongoose, {isValidObjectId} from "mongoose";
import { describe, it } from "mocha";
import Assert from "assert"
process.loadEnvFile("./.env")

const assert = Assert.strict
const UriMongo = process.env.URIMONGO

try {
    await mongoose.connect(UriMongo, {dbName: "Adoptme"})
} catch (error) {
    console.log(`Error al conectar la DB`);
}

describe("Pruebas al Dao de users", function(){
    this.timeout(10_000)

    before(async()=>{
        this.usersDAO=new Users()
        this.userMock={
            first_name: "test",
            last_name: "test",
            email: "test@test.com",
            password: "test"
        }
    })

    after(async()=>{
        await mongoose.connection.collection("users").deleteMany({email:"test@test.com"})
    })

    it("El metodo get devuelve un array de usuarios", async()=>{
        let resultado= await this.usersDAO.get()

        assert.equal(Array.isArray(resultado), true)
        if(Array.isArray(resultado) && resultado.length>0){
            assert.ok(resultado[0]._id)
            assert.ok(resultado[0].email)
        }
    })

    it("El metodo save envia un usuario valido y lo graba en la DB", async()=>{
        let resultado=await this.usersDAO.save(this.userMock)

        assert.ok(resultado._id)
        assert.equal(isValidObjectId(resultado._id), true)
        assert.ok(resultado.email)
        assert.ok(resultado.first_name)
        assert.equal(resultado.email, this.userMock.email)
        assert.equal(resultado.first_name, this.userMock.first_name)

        let consultaDB=await mongoose.connection.collection("users").findOne({email:this.userMock.email})
        assert.ok(consultaDB._id)
    })
})
