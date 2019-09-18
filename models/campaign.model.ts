import mongos from 'mongoose'
import validator from 'mongoose-unique-validator'

const schema = new mongos.Schema({

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
    company       : { type: mongos.Schema.Types.ObjectId, ref: 'Company' }, 
    status        : { type: String, default: 'active' },
    addedBy       : { type: mongos.Schema.Types.ObjectId, ref: 'User' },
    addedDate     : { type: Date, default: Date.now },
    modification  : [{
        _id       : false,
        user      : { type: mongos.Schema.Types.ObjectId, ref: 'User' },
        date      : { type: Date, default: Date.now },
        updated   : { type: Array }
    }]
}, { collection: 'campaigns' } )


schema.plugin( validator, { message: 'Ya existe {VALUE} en la base de datos' } )

const CampaignModel = mongos.model( 'Campaign', schema )

export default CampaignModel