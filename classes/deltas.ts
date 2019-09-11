import UserModel from "../models/user.model";



export default class Deltas {

    public user(id: String, data: any): Promise < any > {

        const required = 'name last_name gender email user_name phone role area boss status normalizedToLink'
        const arr = required.split(' ')
        return new Promise((resolve: any, reject: any) => {
            UserModel.findById(id, required, (res: any, info: any) => {
                let delta: any = {}
                if (res) {
                    reject(null)
                }

                arr.forEach((d: any) => {
                    console.log( typeof info[d], typeof data[d] )
                    if ( info[d] && data[d] ) {
                        if (info[d] != data[d]) {
                            delta[d] = data[d]
                        }
                    }
                })
                console.log( delta )
                resolve(delta)
            })
        })
    }
}