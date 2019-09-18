import { Router, Request, Response } from 'express'
import { error500, error400 } from '../../global/errors';
import CompanyModel from '../../models/company.model';
import { auth } from '../../middlewares/auth.middleware';
import Deltas from '../../classes/deltas';
import md5 = require('md5');


const CompanyRoute = Router()
const deltas = new Deltas()

CompanyRoute.get( '/:skip/:limit/:name?', ( req: Request, res: Response ) => {

    const name = req.params.name
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
        requestData = 'name contact phone photo email normalizedToLink status modification',
        cond = {}
    }

    const query = CompanyModel.find()

    query.select( requestData ).where( cond )
    .skip( skip ).limit( limit )
    .populate( { path: 'addedBy', select: 'name last_name' } )
    .populate( { path: 'modification.user', select: 'name last_name' } )
    .exec( ( err: any, data: any ) => {
        let response: any
        if ( err ) return res.status( 500 ).json( { message: error500 } )

        if ( data.length === 0 && name ) {
            cond = { '$or': [ 
                { 'name': { '$regex': `.*${ name }.*`, '$options': 'i' } },
                { 'contact': { '$regex': `.*${ name }.*`, '$options': 'i' } },
                { 'email': { '$regex': `.*${ name }.*`, '$options': 'i' } }
            ] }
            CompanyModel.find().where( cond ).select( requestData )
            .skip( skip ).limit( limit )
            .populate( { path: 'addedBy', select: 'name last_name' } )
            .exec( ( err: any, data: any ) => {
                if ( err ) return res.status( 500 ).json( { message: error500 } )
                
                CompanyModel.countDocuments( ( err: any, count: number ) => {
                    res.status( 200 ).json( { data, count } )
                })
            })

        } else {
            CompanyModel.countDocuments( ( err: any, count: number ) => {
                res.status( 200 ).json( { data, count } )
            })
        }

    })
})

CompanyRoute.post('/', [ auth ], ( req: Request, res: Response ) => {
    const name    = req.body.name[0]
    const contact = req.body.contact
    const phone   = req.body.phone
    const email   = req.body.email
    const address = req.body.address
    const type    = req.body.type
    const addedBy = req.body.user
    
    if( !name || !contact || !phone || !email || !address || !type  ) {
        return res.status( 400 ).json({ message: error400 })
    }

    const model = new CompanyModel( { name, contact, phone, email, address, type, addedBy } )

    model.save( ( err: any, saved: any ) => {

        if( err ) {
            return res.status( 500 ).json({ message: error500, err })
        }

        if( req.files ) {
            const file: any  = req.files.image
            if( /^(image)\//i.test( file.mimetype ) ) {
                const fileName = `${ md5( `${ file.name }.${ saved._id }-${ new Date().getMilliseconds() }` ) }.png`
                const ntl      = `${req.body.name[0]}-${ saved._id }`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').toLowerCase()
                const path     = `./uploads/companies/${ fileName }`
                const obj      = { photo: fileName, normalizedToLink: ntl }
                
                file.mv( path, (err: any) => {
                              
                    if( !err ) {
                        CompanyModel.findByIdAndUpdate( saved._id, obj, ( err: any ) => {
                            if( err ) {
                                return res.status( 500 ).json({message: error500, err})
                            }       
                            res.status( 201 ).json({ })
                        })
                    } else {
                        return res.status( 500 ).json({ message: 'No fue posible actualizar la imagen. Registro creado'})
                    }
                })
            }
        }
    }) 
})


CompanyRoute.put( '/:id', [auth],  ( req: Request, res: Response ) => {

    const updater = req.body.user
    const id      = req.params.id
    const model: any = {
        name:    req.body.name,
        contact: req.body.contact,
        type:    req.body.type,
        phone:   req.body.phone,
        email:   req.body.email,
        address: req.body.address,
        status:  req.body.status
    }

    if ( !model.name || !model.contact || !model.type || !model.phone || !model.email || !model.address || !model.status ) {
        return res.status( 400 ).json( { message: 'La información no se envió completa' })
    }

    const required = 'name contact email phone status address type'
    deltas.company( id, model, required )
    .then( ( delta: Array<any> ) => {
        if( delta.length > 0 ){

            const toUpdate: any = {}
            const compareKeys: any = {
                name: 'El nombre',  contact: 'El contacto', type: 'El tipo de empresa',
                phone: 'El teléfono', email: 'El correo', status: 'El estado', address: 'El domicilio'
            }

            delta.forEach( ( d: any, index: number ) => {
                toUpdate[ d.field ] = d.to
                delta[ index ].field = compareKeys[ d.field ]
            })
            toUpdate.$push = { modification: { date: new Date(), user: updater, updated: delta } }
            toUpdate.normalizedToLink = `${ model.name }-${ id }`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').toLowerCase()

            CompanyModel.findOneAndUpdate( {_id: id }, toUpdate, ( err: any, saved: any ) => {

                if( err )  return res.status( 500 ).json({ message: error500 })
  
                if( req.files ) {
                    const file: any  = req.files.image
                    if( /^(image)\//i.test( file.mimetype ) ) {
                        const fileName = `${ md5( `${ file.name }.${ id }-${ new Date().getMilliseconds() }` ) }.png`
                        const path     = `./uploads/companies/${ fileName }`
                        const obj      = { photo: fileName }
                        
                        file.mv( path, (err: any) => {          
                            if( err ) return res.status( 500 ).json({ message: 'Se actualizó la empresa pero no la foto' })

                            CompanyModel.findByIdAndUpdate( id, obj, ( err: any ) => {
                                if( err ) return res.status( 500 ).json({ message: error500 })
                                res.status( 204 ).json({})
                            })
                        })
                    }
                } else {
                    res.status( 204 ).json({})
                }
            })

        } else {
            return res.status( 204 ).json({ message: 'Sin información que actualizar' }) 
        }
    })
    .catch( () => {
        return res.status( 500 ).json({ message: error500 })
    })
})

export default CompanyRoute