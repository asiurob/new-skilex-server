import { Router, Request, Response } from 'express'
import UserModel from '../../models/user.model'
import { error500 } from '../../global/errors'


const BossRoute = Router()


BossRoute.get( '/:rol/:area', ( req: Request, res: Response ) => {

    const area: String = req.params.area,
          rol: Number  = Number(req.params.rol)

    UserModel.find().sort('name')
    .populate({ path: 'role', select: 'hierarchy name'} )
    .where('area', area )
    .select('name last_name _id hierarchy')
    .exec( ( err: any, data: any ) => {
        if( err ) {
            return res.status( 500 ).json( { message: error500, err } )
        }
        const result = data.filter( ( u: any ) => u.role.hierarchy > rol || u.role.hierarchy === 6 );
        res.status( 200 ).json( { data: result } )
    })
})


export default BossRoute