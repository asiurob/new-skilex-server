import { Router, Request, Response } from 'express'
import CampaignModel from '../../models/campaign.model'
import { error500 } from '../../global/errors'
import md5 from 'md5'

const CampaignRoute = Router()

CampaignRoute.get( '/:id?', ( req: Request, res: Response ) => {

    const id: String = req.params.id

    let obj: any = {}
    
    if ( id ) obj._id = id

    CampaignModel.find( obj )
    .exec( ( err: any, data: any ) => {
        if( err ) {
            return res.status( 500 ).json( { message: error500, err } )
        }

        res.status( 200 ).json( { data } )
    })
})


CampaignRoute.post('/', ( req: Request, res: Response ) => {

    const model = new CampaignModel({
        name: req.body.name,
        contact: req.body.contact,
        phone: req.body.phone,
        address: req.body.address,
        zip: req.body.zip,
        noemployees: req.body.noemployees,
        type: req.body.type,
        date: req.body.date,
        time: req.body.time,
        people: req.body.people.split(','),
        comments: req.body.comments,
        email: req.body.email
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
            const file: any  = req.files.photo
            if( /^(image)\//i.test( file.mimetype ) ) {
                const id       = saved._id
                const fileName = `${ md5( `${ file.name }.${ id }` ) }.${ file.name.split('.')[ file.name.split('.').length - 1 ] }`
                const path     = `./uploads/campaigns/${ fileName }`
                const obj      = { photo: fileName }
                
                file.mv( path, (err: any) => {             
                    if( !err ) {
                        CampaignModel.findByIdAndUpdate( id, obj, ( err: any, up: any ) => {
                            if( err ) {
                                return res.status( 500 ).json({
                                    message: error500,
                                    error: err
                                })
                            }
                            
                            res.status( 200 ).json( { 
                                message: `Se insertó correctamente la campaña ${ req.body.name }` 
                            } )
                        })
                    }
                })
            }
        }
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