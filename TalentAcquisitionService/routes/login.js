
// import the modules we will use
var DocumentDBClient = require('documentdb').DocumentClient;
var nconf = require('nconf');
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


exports.Login=function(req,res){
   var url = require('url') ;
   var queryObject = url.parse(req.url,true).query;
if(queryObject.userId==undefined)
{
    queryObject.userId="";
}
if(queryObject.password==undefined)
{
    queryObject.password="";
}


   var querySpec = {
           
    query:'Select * from root r where (r.email=@userId AND r.password=@password)', 
    
        parameters:[{
            name:'@userId',
            value:queryObject.userId
        },
        {
            name:'@password',
            value:queryObject.password
        }
		]
        
    };
    
    
    var db = "dbs/" + databaseId + "/colls/" + collectionId;

    client.queryDocuments(db, querySpec).toArray(function (err, results) {
        if (err) {
            throw (err);
        }        
       res.send(results);
        res.render('layout', { title: '', content: results });
    });
}