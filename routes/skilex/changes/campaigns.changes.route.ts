import { Router, Request, Response } from 'express'
import CampaignModel from '../../../models/campaign.model'
import { error500 } from '../../../global/errors'


const CampaignChangesRoute = Router()


CampaignChangesRoute.get( '/:id', ( req: Request, res: Response ) => {

    const id: String = req.params.id
    const pop_user  = { path: 'modification.user', select: 'name last_name' }

    CampaignModel.find( { _id: id }, 'modification' ).sort({ 'modification.date': 1 })
    .populate( pop_user )
    .lean()
    .exec( ( err: any, data: any ) => {
        if( err ) {
            return res.status( 500 ).json( { message: error500, err } )
        }
        res.status( 200 ).json( { data } )
    })
})


export default CampaignChangesRoute