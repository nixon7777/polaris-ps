/*--
	PS Bot! (Mini)
		Esta es una pequeña version de un bot
		para PS, este bot se ejecuta automaticamente
		al iniciar el servidor(si es que asi se
		desea).

		El bot se conecta al servidor mediante
		'websocket' o 'ws', por lo cual el mismo
		debe ser configurado anteriormente.

			(c) KevinF15
--*/

'use strict';

const input = require('./plugins/utils/console');
let request = require('request'); //eslint-disable-line no-restricted-modules
const util = require('util');
const WebSocket = require('ws');

let config = {
	server: '',
	user: '',
	pass: '',
	rooms: ['lobby'],
	symbol: '.',
	operative: false,
};

let commands = {
	about: function (args, room, user) {
		return 'Hola!, soy **' + config.user + '**, un bot creado y diseñado por **KevinF15**, Si tienes dudas sobre mi funcionamiento consultalo con el.';
	},

	help: function (args, room, user) {
		return 'Actualmente mis comandos son: **about**, **help**, **chiste** y **helix**. Muy pronto tendre mas comandos disponibles.';
	},

	chiste: function (args, room, user) {
		const chistes = [
			'- Íbamos yo y Nacho. - No hijo, íbamos Nacho y yo. - ¿Cómo? ¿entonces yo no iba?',
			'Le dice una madre a su hijo: - ¡Me ha dicho un pajarito que te drogas! - ¡La que se droga eres tu que hablas con pajaritos!.',
			'Mi mujer me ha dejado una nota en la nevera que decía: - Me voy porque esto ya no funciona. Jo, pues si llevo dos horas revisando este cacharro y enfría de lujo.',
			'¿Cómo se llama el campeón de buceo japonés?. Tokofondo. ¿Y el subcampeón?. Kasitoko.',
			'Dos amigos: - Oye, pues mi hijo en su nuevo trabajo se siente como pez en el agua. - ¿Qué hace? - Nada...',
			'- Hola ¿te llamas google? - No, ¿por qué? - Porque tienes todo lo que busco, nena. - ¿Y tú te llamas yahoorespuestas? - No, ¿por qué? - Porque haces preguntas estúpidas...',
			'- Papá, ¿qué se siente tener un hijo tan guapo?. - No sé hijo, pregúntale a tu abuelo...',
			'Estaba una pizza llorando en el cementerio, llega otra pizza y le dice: - ¿Era familiar? - No, era mediana..',
			'- Paco ¿dónde estuviste? - En una clínica donde te quitan las ganas de fumar. - ¡Pero si estás fumando! - Ya... pero sin ganas.',
			'- ¿Bailamos? - Claro. ¿Pero quién saca a mi amiga? - Ahhh, por eso no te preocupes. ¡SEGURIDAAAAD!',
			'- ¡Señorita!¡Eh, usted, la rubia! - ¿Si, es a mi? - ¡Le comunicamos que su avión viene demorado!. - Hay qué lindo, ese es mi color favorito...',
			'Marcelo estaba trabajando, cuando su jefe va y le pregunta: - ¿Oiga, no piensa ir al velatorio de su suegra?. Y él le contesta: - No jefe, primero el trabajo, y después la diversión.',
			'- Tía Teresa, ¿para qué te pintas? - Para estar más guapa. - ¿Y tarda mucho en hacer efecto?',
			'- Te vendo un caballo. - Y yo, ¿para qué quiero un caballo vendado?.',
			'- Capitán, ¿Puedo desembarcar por la izquierda? – Se dice por babor... – Por babor Capitán, ¿Puedo desembarcar por la izquierda?',
			'- Oye, dile a tu hermana que no está gorda, que sólo es talla \'L\' fante...',
			'- Quiero decirle que estoy enamorado de su hija, y no es por el dinero. - ¿Y de cuál de las cuatro? - Ah pues.., de cualquiera.',
			'Dos amigos charlando: - ¿Y tú a quién votarás en las próximas elecciones? - Yo a Alibaba y los 40 ladrones. - ¿Y eso? - Para asegurarme de que solo sean 40.',
			'- Camarero, camarero ¿tiene ancas de rana?. - Sí. - ¡Entonces pegue un saltito y tráigame un café!.',
			'- Mi amor, estoy embarazada. ¿Qué te gustaría que fuera? - ¿Una broma?.',
			'Un codicioso estaba hablando con Dios y le pregunta:- Dios, ¿Cuánto es para ti mil años? Y Dios le contesta:- Un segundo.- ¿Y un millón de pesos?. Y Dios le contesta: - Un centavo.  Entonces el codicioso le dice: ¿Me das un un centavo?. A lo que Dios le contesta:- Espérate un segundo.',
			'Jaimito le pregunta a la maestra: Maestra, ¿usted me castigaría por algo que yo no hice? Claro que no, Jaimito. Ahh, pues que bueno, porque yo no hice mi tarea',
		];

		let chiste = chistes[Math.floor(Math.random() * chistes.length)];
		return chiste;
	},

	helix: function (args, room, user) {
		const respuestas = [
			'Las señales apuntan a que sí.',
			'Sí.',
			'Hay mucha niebla. Inténtalo de nuevo.',
			'Sin lugar a duda.',
			'Mis fuentes dicen que no.',
			'Tal y como lo veo, sí.',
			'Cuenta con ello.',
			'Concéntrate y pregunta de nuevo.',
			'No es buena idea.',
			'Definitivamente no.',
			'Mejor no quieras saber la respuesta.',
			'Muy dudoso.',
			'Sí - Definitivamente.',
			'Es cierto.',
			'No puedo predecir en este momento..',
			'Probablemente.',
			'No entiendo la pregunta.',
			'Mi respuesta es no.',
			'Es buena idea.',
			'No cuentes con ello.',
		];

		let respuesta = respuestas[Math.floor(Math.random() * respuestas.length)];
		return respuesta;
	},
};

function joinServer() {
	if (config.operative === false) {
		input.bot('Bot desactivado por administrador.');
		return false;
	}

	if (!config.server) {
		input.boterror("Se necesita especificar un servidor al cual entrar.");
	} else if (!config.user && !config.pass) {
		input.boterror("Se necesita especificar un nombre de usuario y una contraseña.");
	} else if (config.rooms.length === 0) {
		input.boterror("Se necesita especificar almenos 1 sala a la cual entrar.");
	}

	const ws = new WebSocket("ws://" + config.server + "/showdown/websocket");

	ws.on('open', function () {
		input.bot('Bot iniciado exitosamente!.');
	});

	ws.on('error', function (err) {
		input.boterror(util.inspect(err));
	});

	ws.on('message', function (data) {
		data = data.replace(/(^>|\n)/, '').replace('\n', '');
		let msg = data.split('|');
		switch (msg[1]) {
		case 'challstr':
			let url = "http://play.pokemonshowdown.com/action.php";
			if (config.pass === '') {
				let q = {"act": "getassertion", "userid": config.user, "challengekeyid": msg[2], "challenge": msg[3]};
				request({url: url, qs: q}, function (err, res, body) {
					ws.send("|/trn " + config.user + ",0," + body);
				});
			} else {
				request.post(url, {form: {"act": "login", name: config.user, pass: config.pass,
					"challengekeyid": msg[2], "challenge": msg[3]}}, function (err, res, body) {
						let d = JSON.parse(body.split(']')[1]);
						ws.send("|/trn " + config.user + ",0," + d.assertion);
					});
			}
			for (let x = 0; x < config.rooms.length; x++) {
				ws.send("|/join " + config.rooms[x]);
			}
			break;
		case 'c:':
			let room = msg[0];
			let user = msg[3];
			if (msg[4][0] === config.symbol) {
				let cmd = msg[4].split(config.symbol)[1].split(' ')[0];
				let args = msg[4].split(cmd + ' ')[1];
				if (commands[cmd]) {
					if (typeof commands[cmd] === 'function') {
						let m = commands[cmd].call(this, args, room, user);
						ws.send(room + "|" + m);
					}
				}
			}
			break;
		case 'pm':
		    const emisor = msg[2];
		    const lowmsg = msg[4].toLowerCase();
			if (msg[4][0] === config.symbol) {
				let cmd = msg[4].split(config.symbol)[1].split(' ')[0];
				let args = msg[3].split(cmd + ' ')[1];
				if (commands[cmd]) {
					if (typeof commands[cmd] === 'function') {
						let m = commands[cmd].call(this, args, emisor);
						ws.send('|/pm ' + emisor + ', ' + m);
					}
				}
			}

			// Respuestas predeterminadas
			// ----------
			// Se tratan de una serie de respuestas que el bot
			// envia si el usuario le envia la palabra accionadora.

			if (lowmsg.substr(0, 4) in {'hola':1, 'ola':1, 'holi':1}) {
			    ws.send('|/pm ' + emisor + ', Hola :)');
			} else if (lowmsg.indexOf('como estas') > -1 || lowmsg.indexOf('que tal') > -1 || lowmsg.indexOf('comoandas') > -1 || lowmsg.indexOf('cómo estás') > -1) {
			    ws.send('|/pm ' + emisor + ', Bien, y tu?');
			} else if (lowmsg.indexOf('bien') > -1) {
				ws.send('|/pm ' + emisor + ', Me alegra! ^-^');
			} else if (lowmsg.indexOf('mal') > -1) {
				ws.send('|/pm ' + emisor + ', ¿Que?... Oh, que mal, espero mejores pronto :(.');
			} else if (lowmsg.indexOf('hablas?') > -1) {
				ws.send('|/pm ' + emisor + ', Claro, no ves?');
			} else if (lowmsg.indexOf('ayuda') > -1) {
				ws.send('|/pm ' + emisor + ', Yo solo soy un bot, si necesitas ayuda contacta a al staff del servidor.');
			}
			break;
		}
	});
}

const Bot = exports;

Bot.config = config;
Bot.commands = commands;
Bot.on = joinServer;
