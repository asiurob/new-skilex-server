//Dependencias
import Server from "./classes/server"
import router from "./routes/router"
import bodyParser from 'body-parser'
import cors from 'cors'
import Database from "./classes/database"
import fileUpload from 'express-fileupload'
import express from 'express'

//Importar rutas
import RoleRoute from './routes/skilex/role.route'
import AreaRoute from './routes/skilex/area.route'
import UserRoute from './routes/skilex/user.route'
import LoginRoute from './routes/skilex/login.route'
import ModuleRoute from './routes/skilex/module.route'
import BossRoute from './routes/skilex/boss.route'
import CampaignRoute from './routes/skilex/campaign.route'

// Rutas de listados
import UserListRoute from './routes/skilex/lists/user.list.route'
import CampaignListRoute from './routes/skilex/lists/campaign.list.route'

// Rutas de cambios
import UserChangesRoute from './routes/skilex/changes/user.changes.route'
import CampaignChangesRoute from './routes/skilex/changes/campaigns.changes.route'


//Declaraciones
const server   = Server.instance
const database = Database.instance

//mds
server.app.use( bodyParser.urlencoded({ extended: true }) )
server.app.use( bodyParser.json() )
server.app.use( fileUpload() )
server.app.use( cors( { origin: true, credentials: true } ) )
server.app.use( express.static('uploads') )


//Rutas
server.app.use( '/roles', RoleRoute )
server.app.use( '/departments', AreaRoute )
server.app.use( '/modules', ModuleRoute )
server.app.use( '/users', UserRoute )
server.app.use( '/login', LoginRoute )
server.app.use( '/boss', BossRoute )
server.app.use( '/campaigns', CampaignRoute )

// Rutas lista
server.app.use( '/user-list', UserListRoute )
server.app.use( '/campaign-list', CampaignListRoute )

// Rutas cambios
server.app.use( '/user-changes', UserChangesRoute )
server.app.use( '/campaign-changes', CampaignChangesRoute )


//Iniciar el servidor
server.app.use( '/', router )
server.start( () => {
    console.log( `Server running at ${ server.port } port` )
    //Iniciar base de datos
    database.connect()
})



