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
var collectionId_Candidates = nconf.get("COLLECTION");
var collectionId_Schedule = nconf.get("COLLECTION_Schedule");

// create an instance of the DocumentDB client
var client = new DocumentDBClient(host, { masterKey: authKey });

var smtpTransport = nodemailer.createTransport("SMTP",{
   service: "Gmail",
   auth: {
       user: "suryakumarduvvuri@gmail.com",
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

exports.GetCandidates = function (req, res) {
        
    var querySpec = {
        query: 'SELECT * FROM root'
    };
    var db = "dbs/" + databaseId + "/colls/" + collectionId_Candidates;

    client.queryDocuments(db, querySpec).toArray(function (err, results) {
        if (err) {
            throw (err);
        }        
        
        res.json(results);
    });
};

exports.Submit = function (req, res) {
    var item = req.body;

    var db = "dbs/" + databaseId + "/colls/" + collectionId_Schedule;
    
    client.createDocument(db, item, function (err, doc) {
    });
};