import {
    Router,
    Request,
    Response
} from 'express'
import UserModel from '../../models/user.model'
import {
    error500
} from '../../global/errors'
import bcrypt from 'bcrypt'
import md5 from 'md5'



const PasswordRoute = Router()

PasswordRoute.post('/:id', (req: Request, res: Response) => {

    const id = req.params.id
    const user = req.body.user
    const password = bcrypt.hashSync('Password1!', 10)
    if (!id) {
        return res.status(400).json({
            message: 'No se identificó al usuario'
        })
    }
    const obj: any = {
        password
    }
    const modification = {
        modification: {
            date: new Date(),
            user,
            updated: [{
                field: 'La contraseña',
                from: ' la anterior ',
                to: ' la default'
            }]
        }
    }
    obj['$push'] = modification
    UserModel.findByIdAndUpdate({
        '_id': id
    }, obj, (err: any, up: any) => {

        if (err) {
            return res.status(500).json({
                message: 'Ocurrió un error en la base de datos',
                err
            })
        }
        res.status(201).json({})
    });

})

export default PasswordRoute