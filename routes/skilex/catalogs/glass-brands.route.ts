import { Router, Request, Response } from 'express'
import { error500 } from '../../../global/errors'
import GlassBrandModel from '../../../models/catalogs/glass-brands.model';
import GlassModelsModel from '../../../models/catalogs/glass-models.model';

const GlassBrandRoute = Router()

GlassBrandRoute.get('/:skip/:limit/:status?/:name?', (req: Request, res: Response) => {

    const name     = req.params.name
    const status   = Number(req.params.status)
    const limit    = Number(req.params.limit) || 5
    const pop_user = { path: 'addedBy', select: 'name last_name' } 
    let skip       = Number(req.params.skip) || 1
    let requestData: string
    let cond 

    skip = skip <= 0 ? 1 : (skip - 1) * 5

    if ( status !== 0 ) {
        if ( name ) {
            requestData = '',
            cond = { $and: [ { normalizedToLink: name, status: 'active' } ]  }
        } else {
            requestData = 'name normalizedToLink status addedDate',
            cond = { status: 'active' }
        }
    } else {
        if ( name ) {
            requestData = '',
            cond = { normalizedToLink: name  }
        } else {
            requestData = 'name normalizedToLink status addedDate',
            cond = {}
        }
    }
    GlassBrandModel.find( cond, requestData )
    .skip( skip ).limit( limit ).sort( 'name' )
    .populate( pop_user )
    .exec( ( err: any, data: any ) => {

        if ( err ) return res.status(500).json({ message: error500 })

        if( data.length === 0 && name ) {
            cond = { 'name': { '$regex': `.*${ name }.*`, '$options': 'i' } }
            GlassBrandModel.find( cond, requestData )
            .skip( skip ).limit( limit ).sort( 'name' )
            .populate( pop_user )
            .exec( ( err: any, data: any ) => {

                if ( err ) return res.status(500).json({ message: error500 })

                GlassBrandModel.countDocuments( ( err: any, count: any ) => {
                    return res.status(200).json({ data, count })
                })
            })

        } else {
            GlassBrandModel.countDocuments( ( err: any, count: any ) => {
                return res.status(200).json({ data, count })
            })
        }
    })
})

GlassBrandRoute.post('/', (req: Request, res: Response) => {


    const model = new GlassBrandModel({
        name: req.body.name,
        addedBy: req.body.user
    })

    model.save((err: any, saved: any) => {

        if (err) {
            return res.status(500).json({
                message: error500,
                error: err['errors']['name']['message']
            })
        }
        const ntl = `${req.body.name}-${saved._id}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').toLowerCase()
        GlassBrandModel.findByIdAndUpdate( saved._id, { normalizedToLink: ntl }, ( err: any, resu: any ) => {

            const model_model = new GlassModelsModel({
                name: 'Sin marca',
                addedBy: req.body.user,
                brand: saved._id
            })

            model_model.save(( err: any, saved_model: any ) => {
                const ntl = `${req.body.name}-${saved_model._id}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').toLowerCase()
                GlassModelsModel.findByIdAndUpdate( saved_model._id, { normalizedToLink: ntl }, ( err: any, resu: any ) => {    
                    res.status(200).json({
                        message: `Se insertó correctamente el modelo ${ saved.name }`
                    })
                })
            });
        })
    })
})

GlassBrandRoute.put('/:id', ( req: Request, res: Response ) => {

    const id       = req.params.id,
          newName  = req.body.name,
          user     = req.body.user

    const obj = {
        name: newName,
        normalizedToLink: `${newName}-${ id }`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').toLowerCase()
    }

    if( id && newName && user ) {
        GlassBrandModel.findByIdAndUpdate( id, obj, ( err: any, up: any ) => {
    
            if( err ) {
                return res.status( 500 ).json({
                    message: error500,
                    error: err
                })
            }
            res.status( 201 ).json( { message: `Se actualizó correctamente la marca` } )
    
        })
    } else {
        return res.status(400).json({
            message: 'La información no fue enviada de forma completa'
        })
    }
})

GlassBrandRoute.delete( '/:id/:status', ( req: Request, res: Response ) => {
    const id     = req.params.id
    const status = req.params.status

    if ( !id || !status ) return res.status(400).json({ message: 'No se envió la información' })

    GlassBrandModel.findByIdAndUpdate( id, { status }, ( err: any ) => {
        if ( err ) return res.status(500).json({ message: error500 })

        res.status(201).json({})
    })
})

export default GlassBrandRoute