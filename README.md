# Proyecto Bitcoin
La única ruta que conoce el servidor es http://localhost:9000/bitcoin-data/? en el método GET y requiere un parámetro ( ? ) numérico para ejecutarse

## Instalación
El proyecto corre con [MongoDB](https://www.mongodb.com/what-is-mongodb), [Nodejs](https://nodejs.org/en/) y podemos bajar las dependencias más importantes por medio de `npm` como Angular `npm install -g @angular/cli` y Express `npm install express`

## Volver a organizar el código
Ejecutar la línea `npm install` una vez clonado el proyecto y estando en la carpeta icom-server, las dependencias ya están listas para ser usadas

## ¿Cómo funciona?
Una vez instalado, ejecutar `tsc -watch` para lanzar la compilación de TypeScript, esta creará una carpeta de distribución llamada `dist`, una vez creada ejecutar `nodemon dist/` para levantar el servidor.

## Utiliza sockets y crea la base de datos
Una vez levantado el servidor creará por sí solo la base de datos, las colecciones e insertará los documentos conforme el API de bitso vaya emitiendo la información
