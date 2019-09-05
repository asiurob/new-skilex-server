import mongos from 'mongoose'
import validator from 'mongoose-unique-validator'

const schema = new mongos.Schema({

    name: { 
        type      : String, 
        required  : [ true, 'El nombre del contacto es necesario' ],
        maxlength : [ 50, 'El nombre no puede exceder los 50 caracteres' ],
        minlength : [ 3, 'El contacto debe contener 3 o más caracteres' ]
    },
    contact: { 
        type      : String, 
        required  : [ true, 'El nombre del contacto es necesario' ],
        maxlength : [ 50, 'El nombre no puede exceder los 50 caracteres' ],
        minlength : [ 3, 'El contacto debe contener 3 o más caracteres' ]
    },
    phone: { 
        type      : String, 
        required  : [ true, 'Teléfono es necesario' ],
        maxlength : [ 50, 'El teléfono no puede exceder los 50 caracteres' ],
        minlength : [ 3, 'El teléfono debe contener 3 o más caracteres' ]
    },
    email: { 
        type      : String, 
        required  : [ true, 'El correo es necesario' ], 
        maxlength : [ 100, 'El correo no puede exceder los 100 caracteres'],
        match     : [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                    'El correo electrónico no tiene el formato adecuado'] },
    address: { 
        type      : String, 
        required  : [ true, 'La dirección es necesaria' ],
        maxlength : [ 500, 'La dirección no puede exceder los 500 caracteres' ],
        minlength : [ 3, 'La dirección debe contener 3 o más caracteres' ]
    },
    zip: { 
        type      : String, 
        required  : [ true, 'El código postal es necesario' ],
        maxlength : [ 6, 'El código postal no puede exceder los 5 caracteres' ]
    },
    noemployees   : { type: Number },
    type: { 
        type      : String, 
        required  : [ true, 'El esquema es necesario' ]
    },
    
    date: { type: Date, required  : [ true, 'La fecha del evento es necesaria' ] },
    time: { type: String, required  : [ true, 'La hora del evento es necesaria' ] },
    people: [{ type: mongos.Schema.Types.ObjectId, ref: 'User' }],
    comments: { type: String },
    photo: { type: String },
    utility: { type: Number },
    status        : { type: String, default: 'active' },
    addedBy       : { type: mongos.Types.ObjectId, ref: 'User' },
    addedDate     : { type: Date, default: Date.now },
    modification  : [{
        _id       : false,
        user      : { type: mongos.Types.ObjectId, ref: 'User' },
        date      : { type: Date, default: Date.now },
        updated   : { type: Array }
    }]
}, { collection: 'campaigns' } )


schema.plugin( validator, { message: 'Ya existe {VALUE} en la base de datos' } )

const CampaignModel = mongos.model( 'Campaign', schema )

export default CampaignModel