/*--
	Archivo principal
		Este es el archivo principal del servidor
		y es el que permite que el servidor sea
		encendido mediante 'node.js' y 'socks.js'.

		En este archivo veras unas definiciones que
		te podrian resultar extrañas, te indicare
		donde estan los datos de cada una.
			- Users sus datos estan en users.js.
            - Rooms sus datos estan en rooms.js.
            - Tools sus datos estan en tools.js.
            - Chat sus datos estan en plugins/basic.js.
            - ladders sus datos estan en ladders.js y ladders-remote.js.
            - Sockets sus datos estan en sockets.js.
            - Utils sus datos estan en plugins/utils/index.js

        Cabe destacar que estas son solo algunas de
        las muchas definiciones que podras encontrar
        en este archivo.
--*/

'use strict';

const fs = require('fs');
const PS = global;

// Redirección de datos
// ----------
// Openshift no guarda los datos de la misma
// manera que otras plataformas, por lo que es
// necesario usar una variable que crearon ellos
// mismos para almacenar los datos en el vps.

PS.CONFIG_DIR = (process.env.OPENSHIFT_DATA_DIR) ? process.env.OPENSHIFT_DATA_DIR : './config/';
PS.P_DATA_DIR = (process.env.OPENSHIFT_DATA_DIR) ? process.env.OPENSHIFT_DATA_DIR : './plugins/data/';
PS.LOGS_DIR = (process.env.OPENSHIFT_DATA_DIR) ? (process.env.OPENSHIFT_DATA_DIR + 'logs/') : './logs/';

// API 'run'
// ----------
// Esta funcion ejecuta el comando que se
// especifique en la terminal.
// USO: run('comando');

function run(command) {
	require('child_process').spawnSync('sh', ['-c', command], {stdio: 'inherit'});
}

// ¿Estan los datos completos?
// ----------
// Estas funciones verifican si los archivos
// y datos necesarios para que el servidor
// arranque estan disponibles

// ¿Estan las dependencias instaladas?

try {
	require.resolve('sockjs');
} catch (e) {
	if (require.main !== module) throw new Error("Dependencies unmet");

	console.log('\n----- ¡ATENCION! -----');
	console.log("No se encontro el archivo 'node_modules' y sus dependencias... Resolviendo \n");
	run('npm install --production');
	console.log('RESUELTO! Dependencias instaladas.');
	console.log('-----------------------');
	run('node app.js');
}

// ¿Existe el archivo config.js?

try {
	require.resolve('./config/config');
} catch (err) {
	if (err.code !== 'MODULE_NOT_FOUND') throw err; // Esto no deberia pasar :T
	console.log('\n----- ¡ATENCION! -----');
	console.log("No se encontro el archivo 'config.js'... Resolviendo");
	fs.writeFileSync('./config/config.js', fs.readFileSync('./config/config-example.js'));
	console.log('RESUELTO! Archivo de configuracion creado');
	console.log('-----------------------');
	run('node app.js');
} finally {
	PS.Config = require('./config/config');
	PS.Utils = require('./plugins/utils');
}

// ¿Existe el directorio de avatares?

if (!fs.existsSync(CONFIG_DIR + "avatars/")) {
	fs.mkdirSync(CONFIG_DIR + "avatars/");
}

// ¿Existe la carpeta donde se uardaran los datos de plugins?

if (!fs.existsSync(P_DATA_DIR)) {
	fs.mkdirSync(P_DATA_DIR);
}

// ¿Existe el directorio de los logs?

if (!fs.existsSync(LOGS_DIR)) {
	fs.mkdirSync(LOGS_DIR);
	fs.mkdirSync(LOGS_DIR + 'chat/');
	fs.mkdirSync(LOGS_DIR + 'modlog/');
	fs.mkdirSync(LOGS_DIR + 'repl/');
}

console.log('\nIniciando ' + ('PS!').blue.bold + '\n----------'.grey.bold);

// Variables importantes
// ----------

PS.Monitor = require('./monitor');
PS.Tools = require('./tools');
PS.toId = Tools.getId;
PS.LoginServer = require('./loginserver');
PS.Ladders = require(Config.remoteladder ? './ladders-remote' : './ladders');
PS.Users = require('./users');
PS.Punishments = require('./punishments');
PS.Chat = require('./chat');
PS.Rooms = require('./rooms');

PS.Bot = require('./bot');
Bot.on();

delete process.send; // En caso de que se encuentren procesos activos

PS.Verifier = require('./verifier');
Verifier.PM.spawn();

PS.Tournaments = require('./tournaments');

PS.Dnsbl = require('./dnsbl');
Dnsbl.loadDatacenters();

if (Config.crashguard) {
	// Gracioso accidente - Permite que batallas actuales terminen antes de reiniciar.
	process.on('uncaughtException', err => {
		let crashType = require('./crashlogger')(err, 'The main process');
		if (crashType === 'lockdown') {
			Rooms.global.startLockdown(err);
		} else {
			Rooms.global.reportCrash(err);
		}
	});
	process.on('unhandledRejection', err => {
		throw err;
	});
}

// Inicio de procesos de red
// ---------
// Estos procesos se ejecutan de manera
// que el servidor arranque en socks.js

PS.Sockets = require('./sockets');

exports.listen = function (port, bindAddress, workerCount) {
	Sockets.listen(port, bindAddress, workerCount);
};

if (require.main === module) {
	let port;
	if (process.argv[2]) {
		port = parseInt(process.argv[2]); // eslint-disable-line radix
	}
	Sockets.listen(port);
}

// Subida de ultimas variables
// ---------

// Generemos y guardemos la lista de formatos.
Tools.includeFormats();

PS.TeamValidator = require('./team-validator');
TeamValidator.PM.spawn();

// Inicio de proceso REPL
// ---------

require('./repl').start('app', cmd => eval(cmd));