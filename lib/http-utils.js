
var qs = require('querystring');

module.exports = {

	processPost: function(request, response, success) {
		var method = request.method.toLowerCase();
		
		 if (method == 'post') {
			var body = '';
			
			request.on('data', function (data) {
				body += data;
			});
			
			request.on('end', function () {
				try {
					body = qs.parse(body);
					
					if (!body) {
						throw 'No body';
					}
				} catch (e) {
					response.writeHead(400);
					response.end('invalid or empty post body');
					return;
				}
				
				success(body);
			});
		} else {
			response.writeHead(405);
			response.end('expected POST request (not ' + request.method + ')');
		}
	},
	
	validatePost: function(body, rules, success, fail) {
		var hasF
			counter = 1;
		
		var callback = function(error) {
			if (counter > 0) {
				--counter;
				
				if (error) {
					fail(error);
					counter = -1000000;
				} else if (counter == 0) {
					success();
				}
			}
		};
	
		for (var i = 0; i < rules.length; i++) {
			var rule = rules[i],
				name = rule.name;
			
			if (rule.json) {
				try {
					body[name] = JSON.parse(body[name]);
				} catch (e) {
					callback('"' + name + '" field is not valid JSON');
					return;
				}
			}
			
			if (typeof rule.validate == 'function') {
				counter++;
				rule.validate(body[name], function(value) {
					body[name] = value;
					callback();
				}, function(e) {
					callback('"' + name + '" field is not valid: ' + (e || 'unknown error'));
				});
			}
		}
		
		callback();
	},

	writeCORSHeader: function(response) {
		response.setHeader('Access-Control-Allow-Origin', '*');
		response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With');
	}
	
};
