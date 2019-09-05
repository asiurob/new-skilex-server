import { Router, Request, Response } from 'express'
import UserModel from '../../models/user.model'
import { error500 } from '../../global/errors'
import bcrypt from 'bcrypt'
import md5 from 'md5'

const UserRoute = Router()


UserRoute.get( '/:id?', ( req: Request, res: Response ) => {

    const id: String = req.params.id

    let obj: any = {}
    
    if ( id ) obj._id = id

    UserModel.find( obj ).sort('name')
    .exec( ( err: any, data: any ) => {
        if( err ) {
            return res.status( 500 ).json( { message: error500, err } )
        }

        res.status( 200 ).json( { data } )
    })
})


UserRoute.post( '/',  ( req: Request, res: Response ) => {

    const model = new UserModel({
        name: req.body.name,
        last_name: req.body.lastname,
        user_name: req.body.username.toLowerCase(),
        email: req.body.email.toLowerCase(),
        gender: Number(req.body.gender),
        role: req.body.role.slice(0, -1),
        area: req.body.area,
        phone: req.body.phone,
        boss: req.body.user,
        permissions: [],
        password: bcrypt.hashSync( 'Password1!', 10 ),
        addedBy: req.body.user
    })


    model.save( ( err: any, saved: any ) => {
        if( err ) {
            let errors: Array<String> = [];
            for( let e in err[ 'errors' ] ) { errors.push( err[ 'errors' ][ e ]['message'] ) }

            return res.status( 500 ).json({
                message: error500,
                error: err
            })
        }
        if( req.files ) {
            const file: any  = req.files.image
            if( /^(image)\//i.test( file.mimetype ) ) {
                const id       = saved._id
                const fileName = `${ md5( `${ file.name }.${ id }` ) }.png`
                const path     = `./uploads/users/${ fileName }`
                const obj      = { photo: fileName }
                
                file.mv( path, (err: any) => {             
                    if( !err ) {
                        UserModel.findByIdAndUpdate( id, obj, ( err: any, up: any ) => {
                            if( err ) {
                                return res.status( 500 ).json({
                                    message: error500,
                                    error: err
                                })
                            }
                            
                            res.status( 200 ).json( { 
                                message: `Se insertó correctamente el usuario ${ req.body.name } ${ req.body.lastname }` 
                            } )
                        })
                    }
                })
            }
        }
    })
})

UserRoute.put('/:id', ( req: Request, res: Response ) => {

    const id: String   = req.params.id,
          user: String = req.body.user,
          data: Array<any>  = req.body.data

    let obj: any = {}

    if( data[0] == 'password' ) {
        obj[ data[0] ] = bcrypt.hashSync( 'Password1!', 10 )
        obj[ '$push' ] = { 'modification': { user, updated: ['password', '***', 'Password por default', 'Contraseña'] } }
    } else {
        obj[ data[0] ] = data[2]
        obj[ '$push' ] = { 'modification': { user, updated: data } }
    }
    
        
    UserModel.findByIdAndUpdate( id, obj, ( err: any, up: any ) => {

        if( err ) {
            return res.status( 500 ).json({
                message: error500,
                error: err
            })
        }
        res.status( 204 ).json( {} )
    })
})


export default UserRoute