import { Router, Request, Response } from 'express'
import { error500 } from '../../../global/errors'
import GlassModelsModel from '../../../models/catalogs/glass-models.model'

const GlassModelRoute = Router()

GlassModelRoute.get('/:name?', (req: Request, res: Response) => {

    const name      = req.params.name
    const pop_user  = { path: 'addedBy', select: 'name last_name' }
    const pop_brand = { path: 'brand', select: 'name' }
    if (name) {
        GlassModelsModel.find({
                'normalizedToLink': name
            })
            .populate( pop_user )
            .populate( pop_brand )
            .exec((err: any, data: any) => {
                if (err) {
                    return res.status(500).json({
                        message: error500,
                        err
                    })
                }

                res.status(200).json({
                    data
                })
            })

    } else {
        GlassModelsModel.find({}).sort('name')
        .populate( pop_user )
        .populate( pop_brand )
            .exec((err: any, data: any) => {
                if (err) {
                    return res.status(500).json({
                        message: error500,
                        err
                    })
                }

                res.status(200).json({
                    data
                })
            })
    }
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
        });
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

export default GlassModelRoute