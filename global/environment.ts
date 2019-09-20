export const PORT: number   = Number( process.env.PORT ) || 9000
export const DB: string     = 'ziroDB'
export const DBPORT: number = 27017
export const DBHOST: string = 'mongodb://127.0.0.1'
export const SEED: string   = 'QXJsdWluRGVyZWs='
export const MAIL_CREDENTIALS: any = { 
    host: 'smtp.zoho.com', 
    port: 465, 
    secure: true, 
    auth: { 
        user: 'informa@opticaym.com',
        pass: 'Opticaym26&'
    } 
}