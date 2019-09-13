import { Router, Request, Response } from 'express'
import { error500 } from '../../../global/errors'
import GlassModelsModel from '../../../models/catalogs/glass-models.model'

const GlassModelRoute = Router()

GlassModelRoute.get('/:skip/:limit/:name?', (req: Request, res: Response) => {

    const name      = req.params.name
    const limit     = Number(req.params.limit) || 10
    const pop_user  = { path: 'addedBy', select: 'name last_name' }
    const pop_brand = { path: 'brand', select: 'name', match: { status: 'active' } }
    let skip        = Number(req.params.skip) || 1
    let requestData: string
    let cond 

    skip = skip <= 0 ? 1 : (skip - 1) * 10

    if ( name ) {
        requestData = '',
        cond = { $and: [ { normalizedToLink: name, name: { $ne: 'Sin marca' } } ]  }
    } else {
        requestData = 'name normalizedToLink status addedDate brand',
        cond = { name: { $ne: 'Sin marca' } }
    }

    GlassModelsModel.find( cond, requestData )
    .skip( skip ).limit( limit ).sort( 'name' )
    .populate( pop_user )
    .populate( pop_brand )
    .exec( ( err: any, data: any ) => {

        if ( err ) return res.status(500).json({ message: error500, err })

        if( data.length === 0 && name ) {
            cond = { 'name': { '$regex': `.*${ name }.*`, '$options': 'i' } }
            GlassModelsModel.find( cond, requestData )
            .skip( skip ).limit( limit ).sort( 'name' )
            .populate( pop_user )
            .populate( pop_brand )
            .exec( ( err: any, data: any ) => {

                if ( err ) return res.status(500).json({ message: error500 })

                GlassModelsModel.countDocuments( ( err: any, count: any ) => {
                    data = data.filter( ( d: any ) => d.brand )
                    return res.status(200).json({ data, count })
                })
            })

        } else {
            GlassModelsModel.countDocuments( ( err: any, count: any ) => {
                data = data.filter( ( d: any ) => d.brand )
                return res.status(200).json({ data, count })
            })
        }
    })
})

GlassModelRoute.post('/', (req: Request, res: Response) => {


    const model = new GlassModelsModel({
        name: req.body.name,
        brand: req.body.brand,
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
        GlassModelsModel.findByIdAndUpdate( saved._id, { normalizedToLink: ntl }, ( err: any, resu: any ) => {    
            res.status(200).json({
                message: `Se insertó correctamente el modelo ${ saved.name }`
            })
        })
    })
})

GlassModelRoute.put('/:id', ( req: Request, res: Response ) => {

    const id       = req.params.id,
          newName  = req.body.name,
          brand    = req.body.brand,
          user     = req.body.user

    const obj = {
        name: newName,
        brand,
        normalizedToLink: `${ newName }-${ id }`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').toLowerCase()
    }

    if( id && newName && user && brand ) {
        GlassModelsModel.findByIdAndUpdate( id, obj, ( err: any, up: any ) => {
    
            if( err ) {
                return res.status( 500 ).json({
                    message: error500,
                    error: err
                })
            }
            res.status( 200 ).json( { message: `Se actualizó correctamente el modelo` } )
    
        })
    } else {
        return res.status(400).json({
            message: 'La información no fue enviada de forma completa'
        })
    }
})

GlassModelRoute.delete( '/:id/:status', ( req: Request, res: Response ) => {
    const id     = req.params.id
    const status = req.params.status

    if ( !id || !status ) return res.status(400).json({ message: 'No se envió la información' })

    GlassModelsModel.findByIdAndUpdate( id, { status }, ( err: any ) => {
        if ( err ) return res.status(500).json({ message: error500 })

        res.status(201).json({})
    })
})

export default GlassModelRoute