var restify = require('restify');
var fs = require('fs');
var moment = require('moment');

var server = restify.createServer({
  name: "Fagner's bedroom temperature API"
});

server.use(restify.bodyParser());
server.use(restify.authorizationParser());

server.get('/temperature', function (res, res, next) {
	readFileTemperature(function(data) { 
		res.send(data);	
		next();
	});
});

server.post('/temperature', 
	function(req, res, next) {
		handleAuthorization(req, res, next);
	},
	function(req, res, next) {
		writeFileTemperature(req.body.temperature, function(message) { 
			res.send(message);	
			next();
		});
});

server.listen(process.env.PORT | 80, function() {
  console.log('%s listening at %s', server.name, server.url);
});

function handleAuthorization(req, res, next) {
	var user = req.authorization.basic;
	
	if (user && user.username === process.env.USER | 'Fagner' 
	&& user.password === process.env.PASSWORD | 'temperaturesensor123') {
		next();
	} else {
		res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
		res.send(401, "Need credentials");
	}
}

function readFileTemperature(callback) {
	var buffer = fs.readFile('temperature.txt', 'utf8', function(err, data) {
		if (err) {
			console.error(err);
		}
		if (data) {
			var lines = data.split('\r\n');			
			callback(prettryPrintTemperature(lines[0], lines[1])); 	
			
		} else {
			callback("There is no temperature registered on Fagner's bedroom."); 	
		}
	});
}

function prettryPrintTemperature(temperature, lastUpdated) {
	return "Temperature in Fagner's bedroom is at " + parseFloat(temperature).toFixed(2) + 
	" Celsius degrees (last updated " + moment(lastUpdated, 'DD/MM/YYYY h:mm:ss a').fromNow() + ").";
}

function writeFileTemperature(temperature, callback) {
	fs.writeFile('temperature.txt', temperature + '\r\n' + moment().format('DD/MM/YYYY h:mm:ss a'), function (err) {
  		if (err) { 
  			console.error(err);
  		}
		
  		console.log('Temperature updated.');
  		callback("Temperature updated.");
	});
}