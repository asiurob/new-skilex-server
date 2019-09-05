import { Router, Request, Response } from 'express'
import ModuleModel from '../../models/module.model'
import { error500 } from '../../global/errors'
import { auth } from '../../middlewares/auth.middleware'

const ModuleRoute = Router()

ModuleRoute.get( '/:token/:active?/:id?/:detail?', [ auth ], ( req: Request, res: Response ) => {

    const active: String = req.params.active || 'all',
          id: String     = req.params.id || req.params.id === 'null' ? null : req.params.id,
          detail: String = req.params.detail

    let obj: any = {}
    
    const detailed = detail ? null : 'name route icon'

    if ( id ) obj._id = id
    if ( active !== 'all' ) obj.status = active

    ModuleModel.find( obj, detailed ).sort('name')
    .exec( ( err: any, data: any ) => {
        if( err ) {
            return res.status( 500 ).json( { message: error500, err } )
        }

        res.status( 200 ).json( { data } )
    })
})


ModuleRoute.post( '/',  ( req: Request, res: Response ) => {


    const model = new ModuleModel({
        name: req.body.name,
        route: req.body.route,
        icon: req.body.icon,
        addedBy: req.body.user
    })

    model.save( ( err: any, saved: any ) => {
        
        if( err ) {
            return res.status( 500 ).json({
                message: error500,
                error: err[ 'errors' ][ 'name' ][ 'message' ]
            })
        }
        res.status( 200 ).json( { message: `Se insertó correctamente el módulo ${ saved.name }` } )
    })
})

ModuleRoute.put('/:id', ( req: Request, res: Response ) => {

    const id: String   = req.params.id,
          user: String = req.body.user,
          data: Array<any>  = req.body.data.split(',')

    let obj: any = {}

        obj[ data[0] ] = data[1]
        obj[ '$push' ] = { modification: { user, updated: data } }
    ModuleModel.findByIdAndUpdate( id, obj, ( err: any, up: any ) => {

        if( err ) {
            return res.status( 500 ).json({
                message: error500,
                error: err
            })
        }
        res.status( 200 ).json( { message: `Se actualizó correctamente el área` } )

    })
})


export default ModuleRoute