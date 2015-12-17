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
    item.fullName= req.body.firstName +' ' + req.body.lastName;
    item.employeeType ='Candidate';
    
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

    
exports.updateCandidate = function(req,res) {
     var itemId = req.body.email;
    
    exports.GetEmailItem(itemId, function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            doc.telephone = req.body.telephone;
            doc.firstName=req.body.firstName;
            doc.lastName=req.body.lastName;
            doc.email=req.body.email;
            doc.experience=req.body.experience;
            doc.gender=req.body.gender;
            doc.skillSet=req.body.skillSet;
            doc.lateralHire=req.body.lateralHire;
            doc.qualification=req.body.qualification;
            doc.agency=req.body.agency;
            doc.referal=req.body.referal;
            doc.employeeType=req.body.employeeType;
            
            
            client.replaceDocument(doc._self, doc, function (err, replaced) {
                if (err) {
                    console.log(err);
                } else {
                    res.json(replaced);
                }
            });
        }
    });
        
};

exports.GetEmailItem = function (itemId, callback) {
    var querySpec = {
        query: 'SELECT * FROM root r WHERE r.email=@id',
        parameters: [{
            name: '@id',
            value: itemId
        }]
    };
    var db = "dbs/" + databaseId + "/colls/" + collectionId;
    client.queryDocuments(db, querySpec).toArray(function (err, results) {
        if (err) {
            callback(err);

        } else {
            callback(null, results[0]);
        }
    });
};

exports.getUserDetails = function (req, res) {
         var url = require('url') ;
   var queryObject = url.parse(req.url,true).query;
        var querySpec = {
            query: 'SELECT * FROM root r WHERE r.email=@emailid',
            parameters: [{
                name: '@emailid',
                value: queryObject.emailid
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


exports.ShowEmployees = function (req, res) {
        
        var querySpec = {
            query: 'SELECT * FROM root r WHERE r.employeeType=@type',
            parameters: [ {
                name: '@type',
                value: 'Employee'
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

exports.PanelSubmit = function (req, res) {

    var itemId = req.body.candidateID;
    
    exports.GetItem(itemId, function (err, doc) {
        if (err) {
            //callback(err);
            console.log(err);

        } else {
                
            doc.interviewerDetails = req.body.interviewerDetails;
            
            client.replaceDocument(doc._self, doc, function (err, replaced) {
                if (err) {
                    console.log(err);

                } else {
                    res.json(replaced);
                }
            });
        }
    });
};


exports.GetItem = function (itemId, callback) {
    
    var db = "dbs/" + databaseId + "/colls/" + collectionId;

    var querySpec = {
        query: 'SELECT * FROM root r WHERE r.id=@id',
        parameters: [{
            name: '@id',
            value: itemId
        }]
    };

    client.queryDocuments(db, querySpec).toArray(function (err, results) {
        if (err) {
            callback(err);

        } else {
            callback(null, results[0]);
        }
    });
};    
/* exports.SendEmail= function (req, res) {

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
} */

var ical = require('ical-generator');

var smtpTransport = nodemailer.createTransport("SMTP",{
    service: 'gmail',
    auth: {
        user: 'wiprocarpool@gmail.com',
        pass: 'wipro@2015'
    
        }
});

exports.SendEmail= function (req, res) {
var emailJson= req.body    
//var emailJson= {from : "ramsatish.net@gmail.com",to : "v-ramsaj@microsoft.com",subject : "Meeting",text:"testmail",startdate:new Date(),endDate:new Date()}//req.body
var eventObj = {
                'start' : emailJson.startDate,
                'end' :emailJson.endDate,
                'title' : 'interview schedule',
                'description' : 'Please take the interview',
                'id' : 'wdcwe76234e127eugb', //Some unique identifier
                'location' : 'Hyderabad'
}

var cal = ical();

cal.addEvent({
                start: eventObj.start,
                end: eventObj.end,
                summary: eventObj.title,
                uid: eventObj.id, 
                sequence: 5,
                description: eventObj.description,
                location: eventObj.location,
                organizer: {
                name: 'Wipro HR',
                email: emailJson.from
                                },
                method: 'request'
});

var path = __dirname + eventObj.id + '.ics';
cal.saveSync(path);

   var transporter = nodemailer.createTransport();    
   smtpTransport.sendMail({
   template: 'invite', 
   from:emailJson.from,
   to:emailJson.to,
   subject:emailJson.subject,
   html:emailJson.text,
   attachments : [{fileName:'InterviewSchedule.ics',filePath:path}],
   generateTextFromHTML:true,

  }, function(error, response){
   if(error){
       console.log(error);
   }else{
       console.log("Message sent: " + response.message);
   }
});
    transporter.close();
    
};
exports.SendEmailFromScheduler= function (req, res) {

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