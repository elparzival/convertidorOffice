/*
    Todos los derechos reservados para Mauricio Ortiz, Fiscalía Regional de la Araucanía.
    Licencia Copyleft. (Desarrollo Open Source)
*/

'use strict';

const path = require('path');
const fs = require('fs').promises;

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
    res.json({ mensaje: "API/CONVETIDOR ESTADO OK" })   
})

// POST
app.post('/', async function(req, res) {
    const origen = req.body.origen;
    const destino = req.body.destino;
	const id = req.body.id;
	console.log(`${id} convertido`);
	try {
		await convertir(origen, destino, id);
		res.json({ msg: id }) 
	}catch(error)
	{
		res.json({ msg: error }) 
	}
})

// iniciamos nuestro servidor
app.listen(port)
console.log('API escuchando en el puerto ' + port)

/* Función que convierte un documento word a pdf */
async function convertir(origen, destino, id) {
    const ext = '.pdf'
    const inputPath = origen; //path.join(__dirname, '/resources/2410015430-3De AudienciasJUAN CARLOS CASTRO VERGARA192578616-92665875.doc');
    const outputPath = `${destino}${id}${ext}`; //path.join(__dirname, `/resources/${uuid.v4()}${ext}`);

    // leer file
    const docxBuf = await fs.readFile(inputPath);

    // Convertir a pdf (see Libreoffice docs about filter)
    let pdfBuf = await libre.convertAsync(docxBuf, ext, undefined);
    
    // Here in done you have pdf file which you can save or transfer in another stream
    await fs.writeFile(outputPath, pdfBuf);
}

