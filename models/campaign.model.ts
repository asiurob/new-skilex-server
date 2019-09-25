import mongos from 'mongoose'

const schema = new mongos.Schema({

    date          : { type: Date, required  : [ true, 'La fecha del evento es necesaria' ] },
    employees     : [{ type: mongos.Schema.Types.ObjectId, ref: 'User' }],
    company       : { type: mongos.Schema.Types.ObjectId, ref: 'Company' }, 
    place         : { type: String, default: 'Matriz' }, 
    type          : {  type: String,  required  : [ true, 'El esquema es necesario' ]},
    aprox_costumers : { type: Number },
    comments      : { type: String },
    status        : { type: String, default: 'active' },
    addedBy       : { type: mongos.Schema.Types.ObjectId, ref: 'User' },
    addedDate     : { type: Date, default: Date.now },
    flyer         : { type: Boolean, default: true },
    founds        : { type: Number, default: 0 },
    normalizedToLink: { type: String },
    modification  : [{
        _id       : false,
        user      : { type: mongos.Schema.Types.ObjectId, ref: 'User' },
        date      : { type: Date, default: Date.now },
        updated   : { type: Array }
    }]
}, { collection: 'campaigns' } )


const CampaignModel = mongos.model( 'Campaign', schema )

export default CampaignModel