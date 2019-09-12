import { Router, Request, Response } from 'express'
import UserModel from '../../models/user.model'
import { error500 } from '../../global/errors'
import bcrypt from 'bcrypt'
import md5 from 'md5'
import Deltas from '../../classes/deltas';

const UserRoute = Router()
const deltas    = new Deltas()

UserRoute.get( '/:skip/:limit/:name?', ( req: Request, res: Response ) => {

    const name: String = req.params.name
    const limit = Number(req.params.limit) || 8

    let skip  = Number(req.params.skip) || 1
    skip = skip <= 0 ? 1 : skip
    skip = (skip - 1) * 8
    let requestData: string
    let cond 
    if ( name ) {
        requestData = '',
        cond = { normalizedToLink: name }
    } else {
        requestData = 'name last_name user_name photo email phone normalizedToLink status modification',
        cond = {}
    }

    const pop_role = { path: 'role', select: 'name hierarchy' }
    const pop_area = { path: 'area', select: 'name' }
    const pop_boss = { path: 'boss', select: 'name last_name' }
    const pop_mod  = { path: 'modification.user', select: 'name last_name' }
    const pop_mod_bossf = { path: 'modification.user.updated.from', select: 'name last_name' }
    const pop_mod_bosst = { path: 'modification.user.updated.to', select: 'name last_name' }

    UserModel.find(cond, requestData)
    .populate( pop_role )
    .populate( pop_area )
    .populate( pop_boss )
    .populate( pop_mod )
    .populate( pop_mod_bossf )
    .populate( pop_mod_bosst )
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
    const updater: string = req.body.user
    const id = req.params.id
    const model: any = {
        name: req.body.name,
        last_name: req.body.lastname,
        gender: Number(req.body.gender),
        phone: req.body.phone,
        normalizedToLink: `${req.body.name} ${ req.body.lastname }-${ id }`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').toLowerCase()
    }

    if( req.body.password )  model.password = bcrypt.hashSync( req.body.password, 10 )
    if( req.body.username )  model.user_name = req.body.username.toLowerCase()
    if( req.body.email )     model.email    = req.body.email.toLowerCase()
    if( req.body.role )      model.role     = req.body.role.slice(0, -1)
    if( req.body.area )      model.area     = req.body.area
    if( req.body.boss )      model.boss     = req.body.boss
    if( req.body.active )    model.status   = req.body.active

     deltas.user( id, model )
     .then( ( delta: any ) => {
         if( delta.length > 0 ) {

            const toUpdate: any = {}
            const compareKeys: any = {
                name: 'El nombre',  last_name: 'El apellido', gender: 'La orientación sexual',
                phone: 'El teléfono', password: 'La contraseña', user_name: 'El usuario',
                email: 'El correo', role: 'El rol', area: 'El departamento', 
                boss: 'El jefe directo', status: 'El estado'
            }

            delta.forEach( ( d: any, index: number ) => {
                toUpdate[ d.field ] = d.to
                delta[ index ].field = compareKeys[ d.field ]
            })
            toUpdate['$push'] = { modification: { date: new Date(), user: updater, updated: delta } }

            toUpdate.$push.modification.updated.forEach( ( d: any ) => {
                if( d.field === 'La contraseña' ){
                    d.from = 'XXX'
                    d.to   = 'XXX'
                }
            })  

             UserModel.findOneAndUpdate( {_id: id }, toUpdate, ( err: any, saved: any ) => {
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
                                      
                                      userInfo( id ).then( 
                                        ( data: any) => res.status( 200 ).json({
                                        message: `Se actualizó correctamente el usuario ${ req.body.name } ${ req.body.lastname }`,
                                        data
                                        }))
                                  })
                              }
                          })
                      }
                  } else {
                    userInfo( id ).then( 
                        ( data: any) => res.status( 200 ).json({
                        message: `Se actualizó correctamente el usuario ${ req.body.name } ${ req.body.lastname }`,
                        data
                        }))
                  }
              })
         } else {
            return res.status( 200 ).json({
                message: 'Sin información que actualizar'
            })     
         }
     },
     () => {
        return res.status( 200 ).json({
            message: 'Sin información que actualizar'
        })
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
        const ntl = `${saved.name} ${ saved.last_name }-${ saved._id }`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').toLowerCase()
        if( req.files ) {
            const file: any  = req.files.image
            if( /^(image)\//i.test( file.mimetype ) ) {
                const id       = saved._id
                const fileName = `${ md5( `${ file.name }.${ id }` ) }.png`
                const path     = `./uploads/users/${ fileName }`
                const obj      = { photo: fileName, normalizedToLink: ntl }
                
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

const userInfo = ( id: string ): Promise<any> => {
    return new Promise( ( resolve: any, reject: any ) => {
        const requestedData = 'name last_name permissions photo normalizedToLink status'
        const pop_role  =  { path: 'role', select: 'name hierarchy' }
        const pop_area  = { path: 'area', select: 'name' }
        UserModel.findById( id , requestedData )
        .populate( pop_role )
        .populate( pop_area )
        .exec(( err: any, data: any ) => {
            if( err ) {
                reject( err )
            } else {
                resolve( data )
            }
        })
    })
}


export default UserRoute