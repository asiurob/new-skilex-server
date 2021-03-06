import { Router, Request, Response } from 'express'
import CampaignModel from '../../models/campaign.model'
import { error500 } from '../../global/errors'
import { auth } from '../../middlewares/auth.middleware'
import Deltas from '../../classes/deltas'
import nodemailer  from 'nodemailer'
import { MAIL_CREDENTIALS } from '../../global/environment'


const CampaignRoute = Router()
const deltas = new Deltas()

CampaignRoute.get( '/:skip/:limit/:name?', ( req: Request, res: Response ) => {

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
        requestData = 'type date aprox_costumers comments normalizedToLink modification place',
        cond = {}
    }

    const query = CampaignModel.find()

    query.select( requestData ).where( cond )
    .skip( skip ).limit( limit ).sort( {date: 1, status: -1})
    .populate( { path: 'addedBy', select: 'name last_name' } )
    .populate( { path: 'modification.user', select: 'name last_name' } )
    .populate( { path: 'employees', select: 'name last_name photo normalizedToLink' } )
    .populate( { path: 'company', select: 'name photo normalizedToLink' } )
    .exec( ( err: any, data: any ) => {
        if ( err ) return res.status( 500 ).json( { message: error500 } )

        if ( data.length === 0 && name ) {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            let matches = {}
            if ( name === '_hoy' ) {
                cond = { date: { $gte: new Date().setHours(0,0,0,0), $lt: new Date().setHours(23,59,59,999) } }
            } else if( name === '_ayer' ) {
                today.setDate( today.getDate() - 1 )
                cond = { date: { $gte: today.setHours(0,0,0,0), $lt: today.setHours(23,59,59,999) } }
            } else if( name === '_manana' ) {
                today.setDate( today.getDate() + 1 )
                cond = { date: { $gte: today.setHours(0,0,0,0), $lt: today.setHours(23,59,59,999) } }
            } else if( name === '_anteriores' ) {
                cond = { date: { $lt: today } }

            } else if( name === '_futuras' ) {
                cond = { date: { $gt: today } }

            } else {
                cond = {}
                matches =  { 'name': { '$regex': `.*${ name }.*`, '$options': 'i' } }
            }
            CampaignModel.find().where( cond ).select( requestData )
            .skip( skip ).limit( limit ).sort( 'date' )
            .populate( { path: 'addedBy', select: 'name last_name' } )
            .populate( { path: 'modification.user', select: 'name last_name' } )
            .populate( { path: 'employees', select: 'name last_name photo normalizedToLink' } )
            .populate( { path: 'company', select: 'name photo normalizedToLink', match: matches } )
            .exec( ( err: any, data: any ) => {
                if ( err ) return res.status( 500 ).json( { message: error500 } )
                
                data = data.filter( ( d: any ) => d.company )
                CampaignModel.countDocuments( ( err: any, count: number ) => {
                    res.status( 200 ).json( { data, count } )
                })
            })

        } else {
            CampaignModel.countDocuments( ( err: any, count: number ) => {
                res.status( 200 ).json( { data, count } )
            })
        }

    })
})


CampaignRoute.post('/', [auth], ( req: Request, res: Response ) => {

    if ( !req.body.date || !req.body.time || req.body.employees.length === 0 ||  
        !req.body.company || !req.body.type || !req.body.place ) {
            return res.status( 400 ).json( { message: 'No se envió completa la información' } );
        }

    let date = new Date( `${ req.body.date } ${ req.body.time }:00` )
    const model = new CampaignModel({
        date,
        employees: req.body.employees,
        company: req.body.company,
        place: req.body.place,
        type: req.body.type,
        aprox_costumers: req.body.aprox_costumers,
        comments: req.body.comments,
        addedBy: req.body.user
    })


    model.save( ( err: any, saved: any ) => {
        if( err )  return res.status( 500 ).json({ message: error500 })
        const company = req.body.company_name
        const ntl = `campania-${ company }-${ req.body.place }-${ req.body.date.replace(/\-+/g,'') }-${ saved._id }`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').toLowerCase()
        
        CampaignModel.findByIdAndUpdate( saved._id, { normalizedToLink: ntl }, ( err: any ) => {
            const transport = nodemailer.createTransport( MAIL_CREDENTIALS )
            const html = `
            <div style="text-align:center;">
                <h2 style="color: #007bff;">
                    ¡Hay una nueva campaña para ${ company }!
                    <br><small style="color: #17a2b8;">${ req.body.place }</small>
                    <br><small style="color: #6c757d;">El ${ req.body.date } a las ${ req.body.time }</small>
                </h2>
                <h3>El evento fue creado por <b>${ req.body.userdata.name } ${ req.body.userdata.last_name }</b></h3>
                <ul style="list-style: none;">
                    <li>Empleados aproximados: <b>${ req.body.aprox_costumers }</b></li>
                    <li>Esquema: <b>${ req.body.type }</b></li>
                    <li>Gente asignada: <b>${ req.body.employees.length }</b></li>
                    <li>Comentarios adicionales: <b>${ req.body.comments }</b></li>
                </ul>
                <a href="http://18.221.70.54:9000/campaigns/edit/${ ntl }/1">Puedes revisarlo aquí</a>
            </div>`
    
            const options = {
                from: '"Ziro Hermes" <informa@opticaym.com>',
                to: 'sistemas@opticaym.com, manuel.cruz@opticaym.com',
                subject: `Nueva campaña ${ company.toUpperCase() } el ${ req.body.date } ${ req.body.time }`,
                html
            }

            transport.sendMail( options )
    
            res.status( 201 ).json({})
        })
    })
})

CampaignRoute.put('/:id', [auth], ( req: Request, res: Response ) => {
    
    const updater = req.body.user
    const id      = req.params.id
    const company = req.body.company
    let date = new Date( `${ req.body.date } ${ req.body.time }:00` )
    const model: any = {
        date,
        employees:       req.body.employees,
        place:           req.body.place,
        type:            req.body.type,
        comments:        req.body.comments,
        status:          req.body.status,
        aprox_costumers: req.body.aprox_costumers
    }
    
    if ( !model.date || model.employees.length === 0 || !model.type || !model.place ) {
            return res.status( 400 ).json( { message: 'No se envió completa la información' } );
    }
    
    const required = 'employees status date type aprox_costumers comments place'
    deltas.campaign( id, model, required )
    .then( ( delta: Array<any> ) => {
        if( delta.length > 0 ){
            const toUpdate: any = {}
            const compareKeys: any = {
                date: 'La fecha del evento',  employees: 'Los asistentes', type: 'El tipo de pago',
                comments: 'Los comentarios', aprox_costumers: 'Clientes aproximados', status: 'El estado',
                place: 'La sede'
            }

            delta.forEach( ( d: any, index: number ) => {
                toUpdate[ d.field ] = d.to
                delta[ index ].field = compareKeys[ d.field ]
            })


            toUpdate.$push = { modification: { date: new Date(), user: updater, updated: delta } }
            toUpdate.normalizedToLink =  `campania-${ company }-${ req.body.place }-${ req.body.date.replace(/\-+/g,'') }-${ id }`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').toLowerCase()
            CampaignModel.findOneAndUpdate( {_id: id }, toUpdate, ( err: any ) => {
                
                if( err )  return res.status( 500 ).json({ message: error500 })
                const transport = nodemailer.createTransport( MAIL_CREDENTIALS )
                const html = `
                <div style="text-align:center;">
                    <h2 style="color: #dc3545">
                        Se actualizó la campaña de ${ company }
                        <br><small style="color: #ffc107;">${ req.body.place }</small>
                        <br><small style="color: #6c757d;">El ${ req.body.date } a las ${ req.body.time }</small>
                    </h2>
                    <h3>El evento fue actualizado por <b>${ req.body.userdata.name } ${ req.body.userdata.last_name }</b></h3>
                    <ul style="list-style: none;">
                        <li>Empleados aproximados: <b>${ req.body.aprox_costumers }</b></li>
                        <li>Esquema: <b>${ req.body.type }</b></li>
                        <li>Gente asignada: <b>${ req.body.employees.length }</b></li>
                        <li>Comentarios adicionales: <b>${ req.body.comments }</b></li>
                    </ul>
                    <a href="http://18.221.70.54:9000/campaigns/edit/${ toUpdate.normalizedToLink }/1">Puedes revisarlo aquí</a>
                </div>`
        
                const options = {
                    from: '"Ziro Hermes" <informa@opticaym.com>',
                    to: 'sistemas@opticaym.com, manuel.cruz@opticaym.com',
                    subject: `Se actualizó la campaña ${ company.toUpperCase() } el ${ req.body.date } ${ req.body.time }`,
                    html
                }

                transport.sendMail( options )
                res.status( 204 ).json({})
            })

        } else {
            return res.status( 204 ).json({ message: 'Sin información que actualizar' }) 
        }
    })
    .catch( () => {
        return res.status( 500 ).json({ message: error500 })
    })
}) 


export default CampaignRoute