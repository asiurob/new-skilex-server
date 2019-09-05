import { Router, Request, Response } from 'express'
import RoleModel from '../../models/role.model'
import { error500 } from '../../global/errors'

const RoleRoute = Router()

RoleRoute.get( '/', ( req: Request, res: Response ) => {

    RoleModel.find( { 'status': 'active' } ).sort({'hierarchy': -1})
    .exec( ( err: any, data: any ) => {
        if( err ) {
            return res.status( 500 ).json( { message: error500, err } )
        }

        res.status( 200 ).json( { data } )
    })
})


RoleRoute.post( '/',  ( req: Request, res: Response ) => {

    const model = new RoleModel({
        name: req.body.name,
        addedBy: req.body.user
    })

    model.save( ( err: any, saved: any ) => {
        
        if( err ) {
            return res.status( 500 ).json({
                message: error500,
                error: err[ 'errors' ][ 'name' ][ 'message' ]
            })
        }
        res.status( 200 ).json( { message: `Se insertó correctamente el rol ${ saved.name }` } )
    })
})

RoleRoute.put('/:id', ( req: Request, res: Response ) => {

    const id: String   = req.params.id,
          user: String = req.body.user,
          data: Array<any>  = req.body.data.split(',')

    let obj: any = {}

        obj[ data[0] ] = data[1]
        obj[ '$push' ] = { modification: { user, updated: data } }
    RoleModel.findByIdAndUpdate( id, obj, ( err: any, up: any ) => {

        if( err ) {
            return res.status( 500 ).json({
                message: error500,
                error: err
            })
        }
        res.status( 200 ).json( { message: `Se actualizó correctamente el rol` } )

    })
})


export default RoleRoute