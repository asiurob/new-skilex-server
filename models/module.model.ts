import mongos from 'mongoose'
import validator from 'mongoose-unique-validator'

const schema = new mongos.Schema({

    name: { 
        type      : String, 
        required  : [ true, 'El nombre del módulo es necesario' ],
        unique    : [ true, 'Ya existe una módulo con ese nombre' ],
        maxlength : [ 50, 'El módulo no puede exceder los 50 caracteres' ],
        minlength : [ 3, 'El área debe contener 3 o más caracteres' ]
    },
    route: { 
        type      : String, 
        required  : [ true, 'La ruta es necesaria' ],
        unique    : [ true, 'Ya existe una ruta con ese nombre' ]
    },
    icon: { type: String },
    status        : { type: String, default: 'active' },
    addedBy       : { type: mongos.Types.ObjectId, ref: 'User' },
    addedDate     : { type: Date, default: Date.now },
    modification  : [{
        _id       : false,
        user      : { type: mongos.Types.ObjectId, ref: 'User' },
        date      : { type: Date, default: Date.now },
        updated   : { type: Array }
    }]
}, { collection: 'modules' } )


schema.plugin( validator, { message: 'Ya existe {VALUE} en la base de datos' } )

const ModuleModel = mongos.model( 'Module', schema )

export default ModuleModel