
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var cloudservice = require('./routes/cloudservice');
var http = require('http');
var path = require('path');
var app = express();
var dotenv = require('dotenv');
dotenv.load();
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.bodyParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.post('/cloudservice/', cloudservice.list);
app.post('/cloudservice/:serviceName', cloudservice.get);
app.post('/cloudservice/:serviceName/:deploymentName/:virtualMachineName/start', cloudservice.start);
app.post('/cloudservice/:serviceName/:deploymentName/:virtualMachineName/stop', cloudservice.stop);
app.get('/cloudservice/:id/delete', cloudservice.delete);
app.get('/cloudservice/:id/deploy', cloudservice.deploy);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
