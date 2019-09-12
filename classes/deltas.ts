import UserModel from "../models/user.model";



export default class Deltas {

    public user(id: String, data: any): Promise < any > {

        const required = 'name last_name gender email user_name phone role area boss status normalizedToLink password'
        const arr = required.split(' ')
        return new Promise((resolve: any, reject: any) => {
            UserModel.findById(id, required, (res: any, info: any) => {
                let delta: Array<any> = []
                if (res) {
                    reject(null)
                }

                arr.forEach((d: any) => {
                    if ( info[d] && data[d] ) {
                        if (info[d] != data[d]) {
                            const del: any = {}
                            del.field =  d
                            del.from  = info[d],
                            del.to    = data[d]
                            delta.push( del )
                        }
                    }
                })
                resolve(delta)
            })
        })
    }
}