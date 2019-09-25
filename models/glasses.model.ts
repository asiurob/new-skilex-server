import mongos from 'mongoose'

const schema = new mongos.Schema({
    brand         : { type: mongos.Types.ObjectId, ref: 'GlassBrand' },
    model         : { type: String, required: [ true, 'Se necesita el modelo' ] },
    price         : { 
                        type: Number, 
                        required: [true, 'El precio es necesario'],
                        min: 0
                    },
    primaryColor  : { type: String, required: [true, 'El precio es necesario'] },
    secondaryColor: { type: String },
    quantity      : {
                        type: Number, 
                        required: [true, 'La cantidad de piezas es necesaria'],
                        min: 0
                    },
    left          : {   type: Number,  min: 0 },
    status        : { type: String, default: 'active' },
    normalizedToLink: { type: String },
    addedBy       : { type: mongos.Types.ObjectId, ref: 'User' },
    addedDate     : { type: Date, default: Date.now },
    modification  : [{
        _id       : false,
        user      : { type: mongos.Types.ObjectId, ref: 'User' },
        date      : { type: Date, default: Date.now },
        updated   : { type: Array }
    }]
}, { collection: 'glasses' } )

const GlassesModel = mongos.model( 'Glasses', schema )

export default GlassesModel