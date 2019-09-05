import {  Router, Request, Response } from 'express'
import UserModel from '../../models/user.model'
import { error500 } from '../../global/errors'
import  bcrypt  from 'bcrypt'
import jwt from 'jsonwebtoken'
import { SEED } from '../../global/environment';
import { auth } from '../../middlewares/auth.middleware';


const LoginRouter = Router()

LoginRouter.post('/', ( req: Request, res: Response ) => {

    let user = req.body.user,
        pass = req.body.password
    
    if( !user || !pass ) {
        return res.status(403).json({
            message: 'No se envió usuario y/o contraseña'
        })
    }
    const requestedData = 'name last_name password permissions photo'
    const pop_role = { path: 'role', select: 'name' }
    const pop_area  = { path: 'area', select: 'name' }
    UserModel.find( {$and: [{ 'status': 'active' },{ $or: [ { 'user_name' : user }, { 'email': user } ] }] }, requestedData )
    .populate( pop_role )
    .populate( pop_area )
    .exec(( err: any, data: any ) => {
        if( err ) {
            return res.status(500).json({
                message: error500,
                error: err
            })
        }
        if( !data[0] ) {
            return res.status(401).json({
                message: 'No se encontró el nombre de usuario',
                error: err
            })
        }

        if( !bcrypt.compareSync( pass, data[0].password ) ) {
            return res.status(401).json({
                message: 'La contraseña es incorrecta',
                error: err
            })
        }

        data[0]['password'] = null

        const token = jwt.sign( { user: data }, SEED, { expiresIn: '6h' } )

        res.status(200).json({
            data, token
        })

    })
})

LoginRouter.put('/', [ auth ], ( req: Request, res: Response ) => {

    res.status(200).json({ auth: true })

})

export default LoginRouter