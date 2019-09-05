//Dependencias
import express from 'express'
import { PORT } from '../global/environment'
import socket from 'socket.io'
import http from 'http'


//Clase principal
export default class Server {

    private static _instance: Server
    public app: express.Application
    public port: number
    public io: socket.Server
    private http: http.Server

    //Inicializar variables y métodos
    //Implementación de patrón Singleton
    private constructor() {

        this.app  = express()
        this.port = PORT
        this.http = new http.Server( this.app )
        this.io   = socket( this.http )

        this.listenSockets()
    }

    //Regresar la instancia corriendo patrón Singleton
    public static get instance() {
        return this._instance || ( this._instance = new Server() )
    }

    //Método principal para escuchar sockets
    private listenSockets() {

        this.io.on('connection', client => {
            console.log( `New Client` )
        })

    }

    //Método para iniciar el servidor
    start( callback: any ) {
        this.http.listen( this.port, callback )
    }

}