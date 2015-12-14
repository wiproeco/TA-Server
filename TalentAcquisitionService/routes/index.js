// import the modules we will use
var DocumentDBClient = require('documentdb').DocumentClient;
var nconf = require('nconf');
var config = require('./../config');
var nodemailer = require("nodemailer"); 
// tell nconf which config file to use
nconf.env();
nconf.file({ file: 'config.json' });

var host = nconf.get("HOST");
var authKey = nconf.get("AUTH_KEY");
var databaseId = nconf.get("DATABASE");
var collectionId = nconf.get("COLLECTION");


// create some global variables which we will use later to hold instances of the DocumentDBClient, Database and Collection

// create an instance of the DocumentDB client
var client = new DocumentDBClient(host, { masterKey: authKey });

exports.registerCandidate = function (req, res, callback) {
    var db = "dbs/" + databaseId + "/colls/" + collectionId;
    var item = req.body;
    item.registeredDate = Date.now();
    client.createDocument(db, item, function (error, doc) {
        if (error) {
            console.log('Error occured while registering candidate: ', error);
            throw error;
        }
         res.end('success');
        console.log('Registration details', doc);
    });
};

exports.ShowEmployees = function (req, res) {
        
        var querySpec = {
            query: 'SELECT * FROM root r WHERE r.completed=@completed',
            parameters: [{
                name: '@completed',
                value: false
            }]
        };        
     
        var db = "dbs/" + databaseId + "/colls/" + collectionId;


        client.queryDocuments(db, querySpec).toArray(function (err, results) {
        if (err) {
            throw (err);
        }        
       
        res.json(results);
        });
    }; 
exports.SendEmail= function (req, res) {

   var emailJson=req.body
   var transporter = nodemailer.createTransport();    
   transporter.sendMail({
   template: 'email', 
   from:emailJson.from,
   to:emailJson.to,
   subject:emailJson.subject,
   html:emailJson.text,
   generateTextFromHTML:true 
}, function(error, response){
   if(error){
       console.log(error);
   }else{
       console.log("Message sent: " + response.message);
   }
});
    transporter.close();
} 