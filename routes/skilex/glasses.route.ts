import { Router, Request, Response } from 'express'
import { error500 } from '../../global/errors'
import { auth } from '../../middlewares/auth.middleware'
import GlassesModel from '../../models/glasses.model';
import Deltas from '../../classes/deltas';


const GlassesRoute = Router()
const deltas = new Deltas()

GlassesRoute.get('/:skip/:limit/:name?', ( req: Request, res: Response ) => {

    const name     = req.params.name
    const limit    = Number(req.params.limit) || 10
    let skip       = Number(req.params.skip) || 1
    let cond, requestData
    skip = skip <= 0 ? 1 : (skip - 1) * 10
    
    if ( name ) {
        requestData = ''
        cond = { normalizedToLink: name }
    } else {
        requestData = 'brand price model quantity left primaryColor secondaryColor normalizedToLink status'
        cond = {}
    }

    const query = GlassesModel.find( cond )
    query.select( requestData )
    .skip( skip ).limit( limit ).sort( 'brand.name' )
    .populate( { path: 'addedBy', select: 'price' } )
    .populate( { path: 'brand', select: 'name' } )
    .populate( { path: 'modification.user', select: 'name last_name' } )
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
          user           = req.body.user,
          brand_name     = req.body.brand_name
    
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
        const chain = `${ brand_name }-${ model }-${ saved._id }`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').toLowerCase()

        GlassesModel.findByIdAndUpdate( saved._id, { normalizedToLink: chain }, () => {
            res.status(201).json({})
        })

    })

})

GlassesRoute.put('/:id', [auth], ( req: Request, res: Response ) => {

    const id: String = req.params.id,
          brand_name = req.body.brand_name
    
    if ( !req.body.brand || !req.body.model || isNaN( req.body.price ) || !req.body.primaryColor || isNaN( req.body.quantity ) ) {
        return res.status(400).json({ message: 'La información no se envió completa o es inválida' })
    }

    const model = {
        brand          : req.body.brand,
        model          : req.body.model,
        price          : Number( req.body.price ),
        primaryColor   : req.body.primaryColor,
        secondaryColor : req.body.secondaryColor == 0 ? '': req.body.secondaryColor,
        quantity       : Number(req.body.quantity),
        user           : req.body.user
    }

    const required = 'brand model price primaryColor secondaryColor quantity'
    deltas.glasses( id, model, required )
    .then( ( delta: Array<any> ) => {
        if( delta.length > 0 ){
            const toUpdate: any = {}
            const compareKeys: any = {
                brand: 'La marca',  model: 'El modelo', price: 'El precio',
                primaryColor: 'El color primario', secondaryColor: 'El color secundario', quantity: 'La cantidad'
            }

            delta.forEach( ( d: any, index: number ) => {
                toUpdate[ d.field ] = d.to
                delta[ index ].field = compareKeys[ d.field ]
            })


            toUpdate.$push = { modification: { user: model.user, updated: delta } }
            toUpdate.normalizedToLink =  `${ brand_name }-${ model.model }-${ id }`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').toLowerCase()
            GlassesModel.findOneAndUpdate( {_id: id }, toUpdate, ( err: any ) => {
                
                if( err )  return res.status( 500 ).json({ message: error500 })
                res.status( 204 ).json({})
            })

        } else {
            return res.status( 204 ).json({ message: 'Sin información que actualizar' }) 
        }
    })
    .catch( () => {
        return res.status( 500 ).json({ message: error500 })
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
