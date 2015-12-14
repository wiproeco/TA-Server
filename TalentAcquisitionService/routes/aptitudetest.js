// import the modules we will use
var DocumentDBClient = require('documentdb').DocumentClient;
var nconf = require('nconf');
var nodemailer = require("nodemailer");

// tell nconf which config file to use
nconf.env();
nconf.file({ file: 'config.json' });

var host = nconf.get("HOST");
var authKey = nconf.get("AUTH_KEY");
var databaseId = nconf.get("DATABASE");
var collectionId_Questions = nconf.get("COLLECTION_Questions");
var collectionId_Results = nconf.get("COLLECTION_Results");

// create an instance of the DocumentDB client
var client = new DocumentDBClient(host, { masterKey: authKey });

var smtpTransport = nodemailer.createTransport("SMTP",{
   service: "Gmail",
   auth: {
       user: "shital.kad@gmail.com",
       pass: ""
   }
});

exports.SendEmail= function (req, res) {

   var emailJson = req.body;
   var transporter = nodemailer.createTransport();    
   transporter.sendMail({
        template: 'email', 
        from:emailJson.from,
        to:emailJson.to,
        subject:emailJson.subject,
        text:emailJson.text 
    }, function(error, response){
    if(error){
        console.log(error);
    }else{
        console.log("Message sent!");
    }
    });
}

exports.GetQuestions = function (req, res) {
        
    var querySpec = {
        query: 'SELECT * FROM root'
    };
    var db = "dbs/" + databaseId + "/colls/" + collectionId_Questions;

    client.queryDocuments(db, querySpec).toArray(function (err, results) {
        if (err) {
            throw (err);
        }        
        
        res.json(results);
    });
};

exports.SubmitTest = function (req, res) {
    var item = req.body;

    var db = "dbs/" + databaseId + "/colls/" + collectionId_Results;
    
    client.createDocument(db, item, function (err, doc) {
    });
};

