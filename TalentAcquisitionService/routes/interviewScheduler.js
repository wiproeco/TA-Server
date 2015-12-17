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
var collection_Candidates = nconf.get("COLLECTION");
var collectionId_Schedule = nconf.get("COLLECTION_Schedule");

// create an instance of the DocumentDB client
var client = new DocumentDBClient(host, { masterKey: authKey });

exports.GetCandidates = function (req, res) {
    
     var querySpec = {
            query: 'SELECT * FROM root r WHERE r.employeeType=@type',
            parameters: [{
                name: '@type',
                value: 'Candidate'
            }]
    };       
    var db = "dbs/" + databaseId + "/colls/" + collection_Candidates;

    client.queryDocuments(db, querySpec).toArray(function (err, results) {
        if (err) {
            throw (err);
        }        
        
        res.json(results);
    });
};

exports.Submit = function (req, res) {

    var itemId = req.body.candidateID;
    
    exports.GetCandidate(itemId, function (err, doc) {
        if (err) {
            //callback(err);
            console.log(err);

        } else {
            if (req.body.testOrInterview=="Test")
            {
            doc.testDate = req.body.formatDate;
            doc.testTime = req.body.formatTime;    
            
            }else {
                
            doc.interviewDate = req.body.formatDate;
            doc.interviewTime = req.body.formatTime;  
            }
            
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

exports.GetCandidate = function (itemId, callback) {
    var db = "dbs/" + databaseId + "/colls/" + collection_Candidates;

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
};
exports.GetEmployeeInterviewDates= function (req, res) {
     var querySpec = {
            query: 'SELECT f.id , c.id as employeeid,c.date,c.time FROM root f JOIN c IN f.interviewerDetails WHERE c.id=@loginid',
            parameters: [{
                name: '@loginid',
                value: req.query.loginid
            }]
    };       
    var db = "dbs/" + databaseId + "/colls/" + collection_Candidates;

    client.queryDocuments(db, querySpec).toArray(function (err, results) {
        if (err) {
            throw (err);
        }        
        
        res.json(results);
    });
}; 

exports.EmployeeConfirm = function (req, res) {

    var empId = req.body.employeeID;
    var interviewDate = req.body.interviewDate;
    var interviewTime = req.body.interviewTime;
    
    exports.GetDetails(empId,interviewDate,interviewTime, function (err, doc) {
        if (err) {
            //callback(err);
            console.log(err);

        } else {
                
            doc.status = req.body.status;
            
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

exports.GetDetails = function (empId,interviewDate,interviewTime, callback) {
    
    var db = "dbs/" + databaseId + "/colls/" + collection_Candidates;

    var querySpec = {
        query: 'SELECT f.id , c.id as employeeid,c.date,c.time FROM root f JOIN c IN f.interviewerDetails WHERE c.id=@id And c.date=@interviewDate And c.time=@interviewTime',
        parameters: [{
            name: '@id',
            value: empId
        },{
            name: '@interviewDate',
            value: interviewDate
        },{
            name: '@interviewTime',
            value: interviewTime
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