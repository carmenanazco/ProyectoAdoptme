import { mockPets } from "../controllers/mockControllers";

let pruebas =0
let ok = 0
let esperado
let resultado

pruebas ++
console.log(`Prueba ${pruebas}: si envio un argumento numerico, retorna la cantidad de pets creados`);
resultado = mockPets(1)
esperado = 1

if(resultado==esperado){
    ok++
    console.log(``);
    
}