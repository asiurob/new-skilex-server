//Dependencias
import mongo from 'mongoose'

export default class Database {

    private static _instance: Database
    private uri: string

    //Inicializar variables y métodos
    //Implementación de patrón Singleton
    private constructor () {
        this.uri = `mongodb+srv://ziro-slave:CNQEuqt8bLWNvTKM@ziro-cluster-7xg7r.mongodb.net/test?retryWrites=true&w=majority`
    }

    //Regresar la instancia corriendo patrón Singleton
    public static get instance() {
        return this._instance || ( this._instance = new Database() )
    }

    public connect () {
        mongo.set( 'useFindAndModify', false )
        mongo.connect( this.uri, { useNewUrlParser: true }, ( err: any ) => {
            if( err ) { 
                console.log( err ) 
            } else { 
                console.log( `Database connected to cluster` )
            }
        })
    }
}