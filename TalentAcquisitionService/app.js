﻿
/**
 * Module dependencies.
 */
var DocumentDBClient = require('documentdb').DocumentClient;
var config = require('./config');

var express = require('express');
var routes = require('./routes');
var Search=require('./routes/search');
var http = require('http');
var path = require('path');
var aptitudeTest = require('./routes/aptitudetest');
var interviewScheduler=require('./routes/interviewScheduler');
var Login=require('./routes/login');


var app = express();

var bodyParser = require('body-parser')
 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
 });

// all environments
app.set('port', process.env.PORT || 3113);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);

var docDbClient = new DocumentDBClient(config.host, {
    masterKey: config.authKey
});

app.get('/aptitudetest',aptitudeTest.GetQuestions);
app.post('/aptitudetestsubmit',aptitudeTest.SubmitTest);
app.post('/sendscoreemail',aptitudeTest.SendEmail);
app.get('/aptitudetestslot',aptitudeTest.GetTestSlot);
app.post('/registerCandidate', routes.registerCandidate);
app.get('/search',Search.Search);
app.get('/login', Login.Login);
app.get('/ShowEmployees',routes.ShowEmployees); 
app.post('/panelsubmit',routes.PanelSubmit);  
app.post('/SendEmail',routes.SendEmail); 
app.get('/getcandidates',interviewScheduler.GetCandidates);
app.post('/schedulersubmit',interviewScheduler.Submit);
app.post('/SendEmailFromScheduler',routes.SendEmailFromScheduler);
app.post('/updateCandidate',routes.updateCandidate);
app.get('/getUserDetails',routes.getUserDetails);
app.get('/GetEmployeeInterviewDates',interviewScheduler.GetEmployeeInterviewDates);
app.post('/EmployeeConfirm',interviewScheduler.EmployeeConfirm);
app.post('/submittechnicalfeedback',routes.SubmitTechnicalFeedback);

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});