/*--
	Reporte de errores
		Mediante este archivo se permite el
		envio de informacion y datos de un
		error a la terminal o al archivo
		'error.txt'

		© Zarel (Pokemon Showdown)
--*/

'use strict';

require('./app');
const input = require('./plugins/utils/console');
const logPath = require('path').resolve(__dirname, LOGS_DIR + 'errors.txt');

exports = module.exports = function (err, description, data) {
	let stack = (err.stack || err);
	if (data) {
		stack += `\n\nInformación adicional:\n`.red.bold;
		for (let k in data) {
			stack += `  ${k} = ${data[k]}\n`;
		}
	}

	input.error(`${stack}\n`);
	let out = require('fs').createWriteStream(logPath, {'flags': 'a'});
	out.on("open", fd => {
		out.write(`\n${stack}\n`);
		out.end();
	}).on("error", err => {
		input.error(`\n${err.stack}\n`);
	});
};