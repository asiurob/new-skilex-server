import { Router, Request, Response } from 'express'
import UserModel from '../../../models/user.model'
import { error500 } from '../../../global/errors'
import AreaModel from '../../../models/area.model'


const UserChangesRoute = Router()


UserChangesRoute.get( '/:id', ( req: Request, res: Response ) => {

    const id: String = req.params.id
    const pop_user  = { path: 'modification.user', select: 'name last_name' }
    UserModel.find( { _id: id }, 'modification' ).sort({ 'modification.date': 1 })
    .populate( pop_user )
    .lean()
    .exec( ( err: any, data: any ) => {
        if( err ) {
            return res.status( 500 ).json( { message: error500, err } )
        }

        for( let i = 0; i < data[0].modification.length; i++ ) {
            
            if( data[0].modification[ i ][ 'updated' ][ 0 ] === 'area' ) {
                AreaModel.findById( data[0].modification[ i ][ 'updated' ][ 1 ], 'name', ( e: any, area: any ) => {
                    if( !e ) data[0].modification[ i ][ 'updated' ][ 1 ] = area.name
                });

                AreaModel.findById( data[0].modification[ i ][ 'updated' ][ 2 ], 'name', ( e: any, area: any ) => {
                    if( !e ) data[0].modification[ i ][ 'updated' ][ 2 ] = area.name
                });
            }
        }
        res.status( 200 ).json( { data } )
    })
})


export default UserChangesRoute