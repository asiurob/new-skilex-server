import { Router, Request, Response } from 'express'
import UserModel from '../../../models/user.model'
import { error500 } from '../../../global/errors';

const UserCatalogRoute = Router()


UserCatalogRoute.get('/', ( req: Request, res: Response ) => {

    const query = UserModel.find()
    query.select('name last_name _id')
    .where('status', 'active')
    .sort('name')
    .exec( ( err: any, data: any ) => {
        if ( err ) return res.status( 500 ).json( { message: error500 } )
        res.status( 200 ).json( { data } )
    })
})  


export default UserCatalogRoute