import { Router, Request, Response } from 'express'
import CampaignModel from '../../models/campaign.model'
import { error500 } from '../../global/errors'
import { auth } from '../../middlewares/auth.middleware'
import nodemailer  from 'nodemailer'
import { MAIL_CREDENTIALS } from '../../global/environment';

const CampaignRoute = Router()

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
        requestData = 'type date aprox_costumers comments normalizedToLink',
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
        let response: any
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
        !req.body.company || !req.body.type ) {
            return res.status( 400 ).json( { message: 'No se envió completa la información' } );
        }

    let date = new Date( `${ req.body.date } ${ req.body.time }:00` )
    const model = new CampaignModel({
        date,
        employees: req.body.employees,
        company: req.body.company,
        type: req.body.type,
        aprox_costumers: req.body.aprox_costumers,
        comments: req.body.comments,
        addedBy: req.body.user
    })


    model.save( ( err: any, saved: any ) => {
        if( err )  return res.status( 500 ).json({ message: error500 })
        const company = req.body.company_name;
        const ntl = `campania-${ company }-${ req.body.date.replace(/\-+/g,'') }-${ saved._id }`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').toLowerCase()
        
        CampaignModel.findByIdAndUpdate( saved._id, { normalizedToLink: ntl }, ( err: any ) => {
            const transport = nodemailer.createTransport( MAIL_CREDENTIALS )
            const html = `
            <div style="text-align:center;">
                <h2 style="color: #007bff;">
                    ¡Hay una nueva campaña para ${ company }!
                    <br><small style="color: #6c757d;">El ${ req.body.date } ${ req.body.time }</small>
                </h2>
                <h3>El evento fue creado por <b>${ req.body.userdata.name } ${ req.body.userdata.last_name }</b></h3>
                <ul style="list-style: none;">
                    <li>Empleados aproximados: <b>${ req.body.aprox_costumers }</b></li>
                    <li>Esquema: <b>${ req.body.type }</b></li>
                    <li>Gente asignada: <b>${ req.body.employees.length }</b></li>
                    <li>Comentarios adicionales: <b>${ req.body.comments }</b></li>
                </ul>
                <a href="http://localhost:4200/campaigns/edit/${ ntl }">Puedes revisarlo aquí</a>
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

CampaignRoute.put('/:id', ( req: Request, res: Response ) => {

    const id: String   = req.params.id,
          user: String = req.body.user,
          data: Array<any>  = req.body.data

    let obj: any = {}

    obj[ data[0] ] = data[2]
    obj[ '$push' ] = { 'modification': { user, updated: data } }
    
        
    CampaignModel.findByIdAndUpdate( id, obj, ( err: any, up: any ) => {

        if( err ) {
            return res.status( 500 ).json({
                message: error500,
                error: err
            })
        }
        res.status( 204 ).json( {} )
    })
})


export default CampaignRoute