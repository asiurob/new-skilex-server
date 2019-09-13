import { Router, Request, Response } from 'express'
import { error500 } from '../../global/errors'
import { auth } from '../../middlewares/auth.middleware'
import GlassesModel from '../../models/glasses.model';


const GlassesRoute = Router()


GlassesRoute.get('/:skip/:limit/:name?', ( req: Request, res: Response ) => {

    const name     = req.params.name
    const limit    = Number(req.params.limit) || 10
    let skip       = Number(req.params.skip) || 1
    let requestData: string = ''
    let cond 
    skip = skip <= 0 ? 1 : (skip - 1) * 10

    if ( name ) {
        cond = { normalizedToLink: name }
    } else {
        cond = {}
    }

    const query = GlassesModel.find( cond )
    query.select( requestData )
    .skip( skip ).limit( limit ).sort( 'brand.name' )
    .populate( { path: 'addedBy', select: 'price' } )
    .populate( { path: 'model', select: 'name' } )
    .populate( { path: 'brand', select: 'name' } )
    .exec( ( err: any, data: any ) => {
        if( err ) return res.status( 500 ).json({ message: error500 })
        query.countDocuments( ( err: any, count: any ) => {
            res.status( 200 ).json( { data, count } )
        })
    })
})



GlassesRoute.post('/', [ auth ],  ( req: Request, res: Response ) => {


    const brand          = req.body.brand,
          model          = req.body.model,
          price          = Number( req.body.price ),
          primaryColor   = req.body.primaryColor,
          secondaryColor = req.body.secondaryColor == 0 ? '': req.body.secondaryColor,
          quantity       = Number(req.body.quantity),
          left           = Number(req.body.quantity),
          user           = req.body.user
    
    if ( !brand || !model || isNaN( price ) || !primaryColor || isNaN( quantity ) ) {
        return res.status(400).json({ message: 'La información no se envió completa o es inválida' })
    }

    const mod = new GlassesModel({
        brand: brand,
        model: model,
        price: price,
        primaryColor: primaryColor,
        secondaryColor: secondaryColor,
        quantity: quantity,
        left: quantity,
        addedBy: user
    })

    mod.save( ( err: any, saved: any ) => {
        if ( err ) return res.status(500).json({ message: error500, err })

        const query = GlassesModel.find()
        query.where({_id: saved._id})
        .select( 'brand model' )
        .populate( { path: 'brand', select: 'name' } )
        .populate( { path: 'model', select: 'name' } )
        .exec( ( err: any, result: any ) => { 
            const brandi = result[0].brand.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').toLowerCase()
            const modeli = result[0].model.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').toLowerCase()
            const ntl    = { normalizedToLink: `${ brandi }-${ modeli }-${ result[0]._id }` }
            GlassesModel.findByIdAndUpdate( saved._id, ntl, () => {
                res.status(201).json({})
            })
        })

    })

})

GlassesRoute.delete( '/:id/:status', ( req: Request, res: Response ) => {
    const id     = req.params.id
    const status = req.params.status

    if ( !id || !status ) return res.status(400).json({ message: 'No se envió la información' })

    GlassesModel.findByIdAndUpdate( id, { status }, ( err: any ) => {
        if ( err ) return res.status(500).json({ message: error500 })

        res.status(201).json({})
    })
})

export default GlassesRoute
