import { usersService } from "../services/index.js"
import __dirname from "../utils/index.js";

const getAllUsers = async(req,res, next)=>{
    try {
        const users = await usersService.getAll();
        res.send({status:"success",payload:users})
    } catch (error) {
        next(error)
    }
}

const getUser = async(req,res, next)=> {
    try {
        const userId = req.params.uid;
        const user = await usersService.getUserById(userId);
        if(!user) return res.status(404).send({status:"error",error:"User not found"})
        res.send({status:"success",payload:user})
    } catch (error) {
        next(error)
    }
}

const updateUser =async(req,res, next)=>{
    try {
        const updateBody = req.body;    
        const userId = req.params.uid;
        const user = await usersService.getUserById(userId);
        if(!user) return res.status(404).send({status:"error", error:"User not found"})
        const result = await usersService.update(userId,updateBody);
    //console.log(result);
    
        res.send({status:"success",message:"User updated"})
    } catch (error) {
        next(error)
    }
}

const deleteUser = async(req,res,next) =>{
    try {
        const userId = req.params.uid;
        const user = await usersService.getUserById(userId);
        if(!user) return res.status(404).send({status:"error", error:"User not found"})
        
        const result = await usersService.delete(userId);
        console.log(result);
        
        res.send({status:"success",message:"User deleted"})
    } catch (error) {
        next(error)
    }
}


const postDocumentUser= async(req, res, next)=>{
    try {
        const { uid } = req.params;
        console.log(uid);
        
        const user = await usersService.getUserById(uid);
        if (!user) return res.status(404).send({ status: 'error', error: 'User not found' });

        const uploadedDocs = req.files.map(file => ({
        name: file.filename,
        reference: `${__dirname}/../public/documents/${file.filename}`
        }));

        user.documents = [...(user.documents || []), ...uploadedDocs];
        await usersService.update(user._id, { documents: user.documents });

        res.send({ status: 'success', message: 'Documents uploaded', payload: uploadedDocs });

    } catch (error) {
        next(error)
    }
}


/**
 * 
 * Crear un endpoint en el router de usuarios api/users/:uid/documents con el método POST que permita subir uno o múltiples archivos y actualizar el atributo “documents” del usuario en cuestión. Utilizar el middleware de Multer para poder recibir los documentos que se carguen en el proyecto.

El middleware de multer deberá estar modificado para que pueda guardar en diferentes carpetas los diferentes archivos que se suban.
Si se sube una imagen de una mascota, deberá guardarlo en una carpeta pets, mientras que ahora al cargar un documento, multer los guardará en una carpeta documents.
Desarrollar los tests funcionales para los endpoints de api/sessions/register y api/sessions/login utilizando los módulos de mocha, chai y supertest.


 */



export default {
    deleteUser,
    getAllUsers,
    getUser,
    updateUser,
    postDocumentUser
}