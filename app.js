var express = require('express');
var routes = require('./logic/routes.js');
var http = require('http');
var path = require('path');

var app = express();
var port;

if(process.argv[2])
  port = process.argv[2];
else
  port = 8888;

// all environments
app.set('port', process.env.PORT || port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('duties'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

var dbManagement = require('./logic/dbManagement');
dbManagement.connect();

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//routes handler
routes(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
