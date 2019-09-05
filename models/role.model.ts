import mongos from 'mongoose'
import validator from 'mongoose-unique-validator'

const schema = new mongos.Schema({

    name: { 
        type      : String, 
        required  : [ true, 'El nombre del rol es necesario' ],
        unique    : [ true, 'Ya existe un rol con ese nombre' ],
        maxlength : [ 50, 'El nombre no puede exceder los 50 caracteres' ],
        minlength : [ 3, 'El rol debe contener 3 o más caracteres' ]
    },
    hierarchy: { type: Number },
    status        : { type: String, default: 'active' },
    addedBy       : { type: mongos.Types.ObjectId, ref: 'User' },
    addedDate     : { type: Date, default: Date.now },
    modification  : [{
        _id       : false,
        user      : { type: mongos.Types.ObjectId, ref: 'User' },
        date      : { type: Date, default: Date.now },
        updated   : { type: Array }
    }]
}, { collection: 'roles' } )


schema.plugin( validator, { message: 'Ya existe {VALUE} en la base de datos' } )

const RoleModel = mongos.model( 'Role', schema )

export default RoleModel