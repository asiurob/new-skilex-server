import mongos from 'mongoose'
import validator from 'mongoose-unique-validator'


const schema = new mongos.Schema({

    name: { 
        type      : String, 
        required  : [ true, 'El nombre es necesario' ], 
        maxlength : [ 50, 'El nombre no puede exceder los 50 caracteres'],
        minlength : [ 3, 'El nombre debe contener 3 o más caracteres'] 
    },
    last_name:  { 
        type      : String, 
        required  : [ true, 'El apellido es necesario' ], 
        maxlength : [ 100, 'El apellido no puede exceder los 50 caracteres'],
        minlength : [ 3, 'El apellido debe contener 3 o más caracteres'],
    },
    user_name:  { 
        type: String, 
        unique    : [ true, 'El usuario está duplicado' ], 
        required  : [ true, 'El usuario es necesario' ], 
        maxlength : [ 25, 'El usuario no puede exceder los 25 caracteres'] },
    email: { 
        type      : String, 
        unique    : [ true, 'El correo está duplicado'], 
        required  : [ true, 'El correo es necesario' ], 
        maxlength : [ 100, 'El correo no puede exceder los 100 caracteres'],
        match     : [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                    'El correo electrónico no tiene el formato adecuado'] },
    gender        : { type: Number, min: 0, max: 2 },
    photo         : { type: String },
    phone         : { type: String },

    role          : { type: mongos.Schema.Types.ObjectId, ref: 'Role' },
    area          : { type: mongos.Schema.Types.ObjectId, ref: 'Area'  },
    boss          : { type: mongos.Schema.Types.ObjectId, ref: 'User'  },
    permissions: [{
        module    : { type: mongos.Schema.Types.ObjectId, ref: 'Module' },
        chmod     :  { type: String, minlength: 1, maxlength: 5, default: 'r' }
    }],

    password      :   { type: String },
    status        :   { type: String, default: 'active' },
    last_login    :   { type: Date },
    addedBy       :   { type: String },
    addedDate     : { type: Date, default: Date.now },
    modification  : [{
        _id       : false,
        user      : { type: mongos.Types.ObjectId, ref: 'User' },
        date      : { type: Date, default: Date.now },
        updated   : { type: Array }
    }]
    
}, { collection: 'users' })

schema.plugin( validator, {  message: 'Ya existe el correo o ID {VALUE} en la base de datos' } )

const UserModel = mongos.model('User', schema )

export default UserModel
