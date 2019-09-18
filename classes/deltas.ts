import UserModel from "../models/user.model";
import CompanyModel from "../models/company.model";



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

    public company(id: String, data: any, required: String): Promise < any > {
        const arr = required.split(' ')
        return new Promise((resolve: any, reject: any) => {
            
            CompanyModel.findById(id, required, (err: any, info: any) => {
                if (err) reject(null)

                resolve( this.loop( arr, info, data ) )
            })
        })
    }

    private loop( indexes: Array<String>, info: Array<any>, data: any ): Array<any> {
        let delta: Array<any> = []

        indexes.forEach( ( index: any) => {
            if ( info[ index ] && data[ index ] ) {
                if ( info[ index ] != data[ index ] ) {
                    const del: any = {}
                    del.field =  index
                    del.from  = info[ index ],
                    del.to    = data[ index ]
                    delta.push( del )
                }
            }
        })
        return delta
    }
}