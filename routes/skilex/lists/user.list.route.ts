import { Router, Request, Response } from 'express'
import UserModel from '../../../models/user.model'
import { error500 } from '../../../global/errors'

const UserListRoute = Router()

UserListRoute.post( '/:pag', ( req: Request, res: Response ) => {

    const skip: number       = Number( req.params.pag ) * 20,
          prediction: string = req.body.prediction,
          area: string       = req.body.area,
          role: string       = req.body.role,
          status: string     = req.body.status,
          andArr: Array<any> = []
    
    
    if( prediction && prediction.trim() !== '' ) { 
        const obj = { $or: [ { 'name': prediction }, { 'email': prediction } ] }
        andArr.push( obj ) 
    }

    if( area && area.trim() !== '' ) {
        andArr.push({ 'area' : area })
    }

    if( role && role.trim() !== '' ) {
        andArr.push({ 'role' : role })
    }

    if( status && status.trim() !== '' && status !== 'all' ) {
        andArr.push({ 'status' : status })
    }
    
    const requestedData = 'name last_name status photo phone email user_name',
          pop_role      = { path: 'role', select: 'name' },
          pop_area      = { path: 'area', select: 'name' },
          and           = andArr.length < 0 ? { $and: andArr } : {}
    
    UserModel.find( and, requestedData )
    .skip( skip )
    .populate( pop_role )
    .populate( pop_area )
    .exec( ( err: any, data: any ) => {
        if( err ) {
            return res.status(500).json({
                message: error500,
                error: err
            })
        }

        UserModel.countDocuments( and, ( err: any, count: any ) => {
            res.status( 200 ).json({ data, count })
        })
        
    })

})



export default UserListRoute