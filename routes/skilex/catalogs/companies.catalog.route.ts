import { Router, Request, Response } from 'express'
import { error500 } from '../../../global/errors'
import CompanyModel from '../../../models/company.model'

const CompanyCatalogRoute = Router()

CompanyCatalogRoute.get('/', ( req: Request, res: Response ) => {

    const query = CompanyModel.find()
    query.select('name _id')
    .where('status', 'active')
    .sort('name')
    .exec( ( err: any, data: any ) => {
        if ( err ) return res.status( 500 ).json( { message: error500 } )
        res.status( 200 ).json( { data } )
    })
})  


export default CompanyCatalogRoute