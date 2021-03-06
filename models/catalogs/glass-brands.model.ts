import mongos from 'mongoose'
import validator from 'mongoose-unique-validator'

const schema = new mongos.Schema({

    name: { 
        type      : String, 
        required  : [ true, 'El nombre de la marca es necesario' ],
        unique    : [ true, 'Ya existe una marca con ese nombre' ],
        maxlength : [ 50, 'El nombre no puede exceder los 50 caracteres' ],
        minlength : [ 3, 'La marca debe contener 3 o más caracteres' ]
    },
    normalizedToLink: { type: String },
    status        : { type: String, default: 'active' },
    addedBy       : { type: mongos.Types.ObjectId, ref: 'User' },
    addedDate     : { type: Date, default: Date.now },
    modification  : [{
        _id       : false,
        user      : { type: mongos.Types.ObjectId, ref: 'User' },
        date      : { type: Date, default: Date.now },
        updated   : { type: Array }
    }]
}, { collection: 'glass_brands' } )


schema.plugin( validator, { message: 'Ya existe {VALUE} en la base de datos' } )

const GlassBrandModel = mongos.model( 'GlassBrand', schema )

export default GlassBrandModel