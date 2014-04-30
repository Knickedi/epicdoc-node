
// method to start the epicdoc server
//
// possible config properties:
// 	silent		this print 
module.exports = function(config) {
	config = config || {};
	
	var fs = require('fs'),
		path = require('path'),
		utils = require('./http-utils');
	
	// setup logger
	var log = require('./log')(!config.silent, config.verbose);
	log.debug('preparing EpicDoc server for startup');
	
	function badRequest(response, message) {
		log.error(message);
		response.writeHead(400);
		response.end(message);
	}
	
	// request path handler
	var handler = {
	
		'/test': function(request, response) {
			// write back "epicdoc-test"
			utils.writeCORSHeader(response);
			response.writeHead(200);
			response.end('epicdoc-test');
			log.verbose('sent "epicdoc-test" response for test request');
		},
		
		'/data': function(request, response) {
			utils.writeCORSHeader(response);
			
			// read and ensure post body
			utils.processPost(request, response, function(body) {
				var validationRules = [{
					name: 'data',
					json: true,
					validate: function(data, success, fail) {
						if (Array.isArray(data)) {
							success(data);
						} else {
							fail('not a valid JSON array');
						}
					}
				}, {
					name: 'datapath',
					validate: function(dataPath, success, fail) {
						try {
							fs.stat(dataPath, function(e, stat) {
								if (!e && stat.isDirectory) {
									success(dataPath);
								} else {
									fail('path is not representing a valid directory');
								}
							});
						} catch (e) {
							fail('path is not representing a valid directory');
						}
					}
				}];
				
				// validate post body parameters
				utils.validatePost(body, validationRules, function() {
					// parameters are valid, write data.js
					var data = 'epicdata = ' + JSON.stringify(body.data, null, 4) + ';',
						dataPath = path.join(body.datapath, 'data.js');
					
					try {
						fs.writeFile(dataPath, data, function(e) {
							if (e) {
								response.writeHead(500);
								response.end('Failed to write to given path: ' + dataPath);
							} else {
								response.writeHead(200);
								response.end('epicdoc-data');
								log.verbose('data written to ' + dataPath + ' - sent "epicdoc-data" response for test request');
							}
						}); 
					} catch (e) {
						response.writeHead(500);
						response.end('Failed to write to given path: ' + dataPath);
					}
				}, function(e) {
					badRequest(response, e);
				});
			});
		},
	};
	
	// handle incoming http requests
	function handleRequest(request, response) {
		// forbid requests which are not from local machine
		if (request.connection.remoteAddress != '127.0.0.1') {
			response.writeHead(403);
			var msg = 'non localhost requests are not allowed';
			
			log.error(msg, '(' + request.connection.remoteAddress + ')');
			response.end(msg);
			return;
		}
		
		// CORS request send OPTIONS to test the connection, we'll respond to that
		if (request.method.toLowerCase() == 'options') {
			utils.writeCORSHeader(response);
			response.writeHead(204);
			response.end();
			return;
		}
	
		// find a handler for url and handle the request if found
		var url = request.url.toLowerCase(),
			handled = false;
		
		for (var handlerPath in handler) {
			if (url.substring(0, handlerPath.length) == handlerPath.toLowerCase()) {
				log.verbose('handling request for path:', handlerPath);
				handler[handlerPath](request, response);
				return;
			}
		}
		
		// we didn't find a handler for requested path
		if (!handled) {
			var msg = 'no handler for path: ' + url;
			log.debug(msg);
			response.end(msg);
		}
	}
	
	// start server and listen for incoming requests
	try {
		var server = require("http").createServer(handleRequest);
		
		server.on('error', function(e) {
			log.error('failed to start server:\n', e);
		});
		server.on('listening', function() {
			log.debug('server listening on port ' + config.port + ' ...');
		});
		
		server.listen(config.port);
	} catch (e) {
		log.error('failed to start server\n', e);
	}
};
