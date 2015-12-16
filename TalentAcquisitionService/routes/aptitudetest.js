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
var collectionId_Registration = nconf.get("COLLECTION");

var randomQuestionsIds =[];
var noOfQuestionsForTest =5;
var generateRandom = function (min, max,data,callback) {
    
     while (randomQuestionsIds.length < noOfQuestionsForTest) {
            var randNum = Math.floor(Math.random() * (max - min + 1)) + min,
                found = false;
            for (var i = 0; i < randomQuestionsIds.length; i++) {
                if (randomQuestionsIds[i] == data[randNum].id) { found = true; break }
            }
            
            if (!found) randomQuestionsIds[randomQuestionsIds.length] = data[randNum].id;
            
        }
        return randomQuestionsIds;
};

var generatecommaseparatedString =  function (inputArrayList) {
        var commaseparatedString="";
        for (var i = 0; i < inputArrayList.length; i++)
        {
            commaseparatedString = commaseparatedString + ",'" + inputArrayList[i] + "'";
            //alert(commaseparatedString);
        }
        return commaseparatedString.substring(1);;

};

// create an instance of the DocumentDB client
var client = new DocumentDBClient(host, { masterKey: authKey });

var smtpTransport = nodemailer.createTransport("SMTP",{
   service: "Gmail",
   auth: {
       user: "wiprocarpool@gmail.com",
       pass: "wipro@2015"
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
    
     var formattedString ="";
     var querySpec1 = {
    query: 'SELECT root.id FROM root'
    };
    var db1 = "dbs/" + databaseId + "/colls/" + collectionId_Questions;
   
    client.queryDocuments(db1, querySpec1).toArray(function (err, results) {
        if (err) {
            throw (err);
        }        
        
        var resultQuestions = generateRandom(0,results.length-1,results);
        formattedString = generatecommaseparatedString(resultQuestions);
        
        var querySpec = {
                query: 'SELECT * FROM root where root.id in('+ formattedString +')'
        };
        var db = "dbs/" + databaseId + "/colls/" + collectionId_Questions;
        
        client.queryDocuments(db, querySpec).toArray(function (err, results) {
            if (err) {
                throw (err);
            }        
            res.json(results);
        });
    });
     
}

exports.SubmitTest = function (req, res) {

    var itemId = req.body.candidateID;
    
    exports.GetItem(itemId, function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            doc.score = req.body.score;
            doc.isPassed = req.body.isPassed;

            client.replaceDocument(doc._self, doc, function (err, replaced) {
                if (err) {
                    console.log(err);
                } else {
                    res.json(replaced);
                }
            });
        }
    });
}

exports.GetItem = function (itemId, callback) {
    var db = "dbs/" + databaseId + "/colls/" + collectionId_Registration;

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
}

exports.GetTestSlot = function (req, res) {
    
    var candidateID = req.query.candidateid;    
        
    var querySpec = {
        query: 'SELECT * FROM root where root.id = @id',
        parameters: [{
            name: '@id',
            value: candidateID
        }]
    };
    var db = "dbs/" + databaseId + "/colls/" + collectionId_Registration;

    client.queryDocuments(db, querySpec).toArray(function (err, results) {
        if (err) {
            throw (err);
        }        
        
        res.json(results);
    });
}

