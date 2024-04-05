/*
    Todos los derechos reservados para Mauricio Ortiz, Fiscalía Regional de la Araucanía.
    Licencia Copyleft. (Desarrollo Open Source)
*/

'use strict';

const path = require('path');
const fs = require('fs').promises;

/* montamos librería para logging */
const winston = require('winston');
const { combine, timestamp, json } = winston.format;

/* montamos librería filebytes para saber tamaño de nuestros archivos */
const fileBytes = require('file-bytes');

/* montamos librería de openoffice */ 
const libre = require('libreoffice-convert');
libre.convertAsync = require('util').promisify(libre.convert);
/* fin openoffice */

/* montamos librería express para tener APIRest */
var express = require('express') //llamamos a Express
var app = express();
/* fin express */

/* montando el lector de parametros por body json */
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
/* fin bodyjson */

const uuid = require('uuid');

var port = process.env.PORT || 8080  // establecemos nuestro puerto

// GET
app.get('/', async function(req, res) {

    try {
        res.json({ mensaje: "API/CONVETIDOR ESTADO OK" })   
	}catch(error)
	{
		res.json({ msg: error.message }) 
	}
})

// POST
app.post('/', async function(req, res) {
    const origen = req.body.origen;
    const destino = req.body.destino;
	const id = req.body.id;
    const ruc = req.body.ruc;
    let result = 0;
	try {
		await convertir(origen, destino, id);
	        console.log(`${id} convertido`);
	        const result = fileBytes.sync(origen);
		res.json({ size: result }) 
	}catch(error)
	{
        const logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'error',
            defaultMeta: {
                id: id,
                ruc: ruc,
                origen: origen,
                destino: destino
            },
            format: combine(timestamp(), json()),
            transports: [
              new winston.transports.File({
                filename: 'errors.log',
              }),
            ],
        });
        logger.error(error.message);
		res.json({ msg: error.message }) 
	}
})

// iniciamos nuestro servidor
app.listen(port)
console.log('API CONVERTIDOR puerto ' + port)

/* Función que convierte un documento word a pdf */
async function convertir(origen, destino, id) {
    const ext = '.pdf'
    const inputPath = origen; 
    const outputPath = `${destino}${id}${ext}`; 

    // leer file
    const docxBuf = await fs.readFile(inputPath);
    
    // Convertir a pdf
    let pdfBuf = await libre.convertAsync(docxBuf, ext, undefined);
    
    //Crea el stream de bytes como resultado
    await fs.writeFile(outputPath, pdfBuf);
}

