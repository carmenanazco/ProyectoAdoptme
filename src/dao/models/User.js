import mongoose from 'mongoose';

const collection = 'Users';

const schema = new mongoose.Schema({
    first_name:{
        type: String,
        required:true
    },
    last_name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role: {
        type:String,
        default:'user'
    },
    pets:{
        type:[
            {
                _id:{
                    type:mongoose.SchemaTypes.ObjectId,
                    ref:'Pets'
                }
            }
        ],
        default:[]
    },
    documents:[
            {
                name: String,
                reference: String //link al documento
            }
        ],
    last_connection: Date
})

const userModel = mongoose.model(collection,schema);

export default userModel;