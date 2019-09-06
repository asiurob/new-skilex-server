import { Router, Request, Response } from 'express'
import UserModel from '../../models/user.model'
import { error500 } from '../../global/errors'
import bcrypt from 'bcrypt'
import md5 from 'md5'

const UserRoute = Router()


UserRoute.get( '/:skip/:limit/:name?', ( req: Request, res: Response ) => {

    const name: String = req.params.name
    const limit = Number(req.params.limit) || 20

    let skip  = Number(req.params.skip) || 1
    skip = skip <= 0 ? 1 : skip
    skip = (skip - 1) * 20
    let requestData
    let cond 
    if ( name ) {
        requestData = '',
        cond = { normalizedToLink: name }
    } else {
        requestData = 'name last_name user_name photo email phone normalizedToLink status',
        cond = {}
    }
    const pop_role    = { path: 'role', select: 'name' }
    const pop_area    = { path: 'area', select: 'name' }
    UserModel.find(cond, requestData)
    .populate( pop_role )
    .populate( pop_area )
    .skip( skip )
    .limit( limit )
    .exec(( err: any, data: any ) => { 
        if( err ) {
            return res.status( 500 ).json( { message: error500, err } )
        }

        if( data.length === 0 && name ) {

            cond = { '$or': [ 
                { 'name': { '$regex': `.*${ name }.*`, '$options': 'i' } },
                { 'last_name': { '$regex': `.*${ name }.*`, '$options': 'i' } },
                { 'email': { '$regex': `.*${ name }.*`, '$options': 'i' } },
                { 'user_name': { '$regex': `.*${ name }.*`, '$options': 'i' } },
            ] }
            requestData = 'name last_name user_name photo email phone normalizedToLink status'

            UserModel.find( cond, requestData )
            .populate( pop_role )
            .populate( pop_area )
            .skip( skip )
            .limit( limit )
            .exec(( err: any, find: any ) => {
                UserModel.count({}, ( err: any, count: any ) => {
                    res.status( 200 ).json( { data: find, count } )
                })
             })

        } else {
            UserModel.count({}, ( err: any, count: any ) => {
                res.status( 200 ).json( { data, count } )
            })
        }


    })
})


UserRoute.post( '/:id',  ( req: Request, res: Response ) => {

    const id = req.params.id
    const model = {
        name: req.body.name,
        last_name: req.body.lastname,
        user_name: req.body.username.toLowerCase(),
        email: req.body.email.toLowerCase(),
        gender: Number(req.body.gender),
        role: req.body.role,
        area: req.body.area,
        phone: req.body.phone,
        boss: req.body.user,
        status: req.body.active,
        normalizedToLink: `${req.body.name} ${ req.body.lastname }`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').toLowerCase()
    }


   UserModel.findOneAndUpdate( {_id: id }, model, ( err: any, saved: any ) => {
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
                const fileName = `${ md5( `${ file.name }.${ id }-${ new Date().getMilliseconds() }` ) }.png`
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
                                message: `Se actualizó correctamente el usuario ${ req.body.name } ${ req.body.lastname }` 
                            } )
                        })
                    }
                })
            }
        } else {
            res.status( 200 ).json( { 
                message: `Se actualizó correctamente el usuario ${ req.body.name } ${ req.body.lastname }` 
            })
        }
    })
})

UserRoute.put( '/',  ( req: Request, res: Response ) => {

    const model = new UserModel({
        name: req.body.name,
        last_name: req.body.lastname,
        user_name: req.body.username.toLowerCase(),
        email: req.body.email.toLowerCase(),
        gender: Number(req.body.gender),
        role: req.body.role.slice(0, -1),
        area: req.body.area,
        phone: req.body.phone,
        boss: req.body.boss,
        permissions: [],
        password: bcrypt.hashSync( 'Password1!', 10 ),
        addedBy: req.body.user,
        normalizedToLink: `${req.body.name} ${ req.body.lastname }`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').toLowerCase()
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


export default UserRoute