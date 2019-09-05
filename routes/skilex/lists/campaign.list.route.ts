import { Router, Request, Response } from 'express'
import CampaignModel from '../../../models/campaign.model'
import { error500 } from '../../../global/errors'

const CamaignListRoute = Router()

CamaignListRoute.post( '/:pag', ( req: Request, res: Response ) => {

    const skip: number       = Number( req.params.pag ) * 20,
          prediction: string = req.body.prediction,
          status: string     = req.body.status,
          andArr: Array<any> = []
    
    
    if( prediction && prediction.trim() !== '' ) { 
        const obj = { $or: [ { 'name': prediction } ] }
        andArr.push( obj ) 
    }

    if( status && status.trim() !== '' && status !== 'all' ) {
        andArr.push({ 'status' : status })
    }
    
    const requestedData = 'name date time photo address phone status email',
          pop_users     = { path: 'people', select: 'name last_name photo' },
          and           = andArr.length < 0 ? { $and: andArr } : {}
    
    CampaignModel.find( and, requestedData )
    .skip( skip )
    .populate( pop_users )
    .sort({ 'date': 'asc' })
    .exec( ( err: any, data: any ) => {
        if( err ) {
            return res.status(500).json({
                message: error500,
                error: err
            })
        }

        CampaignModel.countDocuments( and, ( err: any, count: any ) => {
            res.status( 200 ).json({ data, count })
        })
        
    })

})



export default CamaignListRoute