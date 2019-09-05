import { Router, Request, Response } from 'express'
import AreaModel from '../../models/area.model'
import { error500 } from '../../global/errors'
import { auth } from '../../middlewares/auth.middleware';
import RoleModel from '../../models/role.model';

const AreaRoute = Router()

AreaRoute.get( '/:name?', ( req: Request, res: Response ) => {

    const name = req.params.name

    if( name ) {
        AreaModel.find( { 'normalizedToLink': name } )
        .exec( ( err: any, data: any ) => {
            if( err ) {
                return res.status( 500 ).json( { message: error500, err } )
            }

            res.status( 200 ).json( { data } )
        })  

    } else {
        AreaModel.find( { 'status': 'active' } ).sort('name')
        .exec( ( err: any, data: any ) => {
            if( err ) {
                return res.status( 500 ).json( { message: error500, err } )
            }
    
            res.status( 200 ).json( { data } )
        })
    }

})


AreaRoute.post( '/', [auth], ( req: Request, res: Response ) => {


    const model = new AreaModel({
        name: req.body.name,
        addedBy: req.body.user,
        normalizedToLink: req.body.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').toLowerCase()
    })

    model.save( ( err: any, saved: any ) => {
        
        if( err ) {
            return res.status( 500 ).json({
                message: error500,
                error: err[ 'errors' ][ 'name' ][ 'message' ]
            })
        }
        /*const arr = ['Director', 'Coordinador', 'Gerente', 'Supervisor', 'TaskForce', 'Becario']
        let index = 6
        arr.forEach( ( a: string) => {

            const model = new RoleModel({
                name: a,
                addedBy: req.body.user,
                hierarchy: index
            })

            model.save()
            index--
        })*/
        
        res.status( 200 ).json( { message: `Se insertó correctamente el área ${ saved.name }` } )
    })
})

AreaRoute.put('/:id', ( req: Request, res: Response ) => {

    const id       = req.params.id,
          newName  = req.body.name,
          user     = req.body.user

    const obj = {
        name: newName,
        normalizedToLink: newName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').toLowerCase()
    }

    if( id && newName && user ) {
        AreaModel.findByIdAndUpdate( id, obj, ( err: any, up: any ) => {
    
            if( err ) {
                return res.status( 500 ).json({
                    message: error500,
                    error: err
                })
            }
            res.status( 200 ).json( { message: `Se actualizó correctamente el área` } )
    
        })
    } else {
        return res.status(400).json({
            message: 'La información no fue enviada de forma completa'
        })
    }
})


export default AreaRoute