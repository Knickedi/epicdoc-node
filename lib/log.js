
module.exports = function(debug, verbose) {
	
	function print(prefix, fn, args) {
		args = Array.prototype.slice.call(args);
		args.unshift(prefix, '[' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ']');
		fn.apply(console, args);
	}
	
	return {
	
		error: function() {
			print('E', console.error, arguments);
		},
	
		debug: function() {
			if (debug) {
				print('D', console.log, arguments);
			}
		},
		
		verbose: function() {
			if (debug && verbose) {
				print('V', console.log, arguments);
			}
		}
	}
	
};
