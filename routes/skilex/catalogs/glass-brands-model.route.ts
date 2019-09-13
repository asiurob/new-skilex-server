import { Router, Request, Response } from 'express'
import { error500 } from '../../../global/errors'
import GlassModelsModel from '../../../models/catalogs/glass-models.model';


const GlassBrandModelRoute = Router()


GlassBrandModelRoute.get('/:brand', ( req: Request, res: Response ) => {
    const brand = req.params.brand
    if ( !brand ) {
        return res.status(400).json({ message: 'No se envió la marca' })
    }

    const query = GlassModelsModel.find()
    query.where({ brand }).sort('name').select('name _id')
    .exec( ( err: any, data: any ) => {
        if ( err ) return res.status(500).json({ message: error500 })
        res.status(200).json({ data })
    })
})

export default GlassBrandModelRoute