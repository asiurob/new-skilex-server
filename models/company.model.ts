import mongos from 'mongoose'


const schema = new mongos.Schema({

    name: { 
            type      : String, 
            required  : [ true, 'El nombre del contacto es necesario' ],
            maxlength : [ 200, 'El nombre no puede exceder los 50 caracteres' ],
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
    type          : {  type: String, required  : [ true, 'El tipo de empresa' ] },
    photo         : { type: String },
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
}, { collection: 'companies' } )

const CompanyModel = mongos.model('Company', schema )

export default CompanyModel