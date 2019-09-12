import { Router, Request, Response } from 'express'
import { error500 } from '../../../global/errors'
import GlassBrandModel from '../../../models/catalogs/glass-brands.model';

const GlassBrandRoute = Router()

GlassBrandRoute.get('/:name?', (req: Request, res: Response) => {

    const name     = req.params.name
    const pop_user = { path: 'addedBy', select: 'name last_name' } 
    if (name) {
        GlassBrandModel.find({
                'normalizedToLink': name
            })
            .populate( pop_user )
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
        GlassBrandModel.find({}).sort('name')
        .populate( pop_user )
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
            res.status(200).json({
                message: `Se insertó correctamente la marca ${ saved.name }`
            })
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
            res.status( 200 ).json( { message: `Se actualizó correctamente la marca` } )
    
        })
    } else {
        return res.status(400).json({
            message: 'La información no fue enviada de forma completa'
        })
    }
})

export default GlassBrandRoute