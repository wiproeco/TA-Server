
function stringToDate(_date,_format,_delimiter)
{
            var formatLowerCase=_format.toLowerCase();
            var formatItems=formatLowerCase.split(_delimiter);
            var dateItems=_date.split(_delimiter);
            var monthIndex=formatItems.indexOf("mm");
            var dayIndex=formatItems.indexOf("dd");
            var yearIndex=formatItems.indexOf("yyyy");
            var month=parseInt(dateItems[monthIndex]);
            month-=1;
            var formatedDate = new Date(dateItems[yearIndex],month,dateItems[dayIndex]);
            return formatedDate;
}


 
// exports.Search = function (req, res) {
//    // res.send(req.param.id);
//    var url = require('url') ;
//    var queryObject = url.parse(req.url,true).query;
//    res.send(queryObject);
//   // res.send(queryObject.name);
//   //console.log(queryObject);
// }; 



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
var skills="";

// create some global variables which we will use later to hold instances of the DocumentDBClient, Database and Collection

// create an instance of the DocumentDB client
var client = new DocumentDBClient(host, { masterKey: authKey });


exports.Search=function(req,res){
   var url = require('url') ;
   var queryObject = url.parse(req.url,true).query;
if(queryObject.name==undefined)
{
    queryObject.name="";
}
if(queryObject.qualification==undefined)
{
    queryObject.qualification="";
}
if(queryObject.skillset=="undefined")
{
    queryObject.skillset="";    
    skills="";
}
else{
     skills=(queryObject.skillset).toString();
    
}
if(queryObject.telephone==undefined)
{
    queryObject.telephone="";
}
if(queryObject.ratingininterview==undefined)
{
    queryObject.ratingininterview="";
}
if(queryObject.currentlyworking==undefined)
{
    queryObject.currentlyworking="";
}

if(skills.length>0)
{
var skillResult=skills.split(',');
   skills="";
 for (var i = 0; i < skillResult.length; i++) {
     skills = skills+"\""+ skillResult[i].toString() +"\",";
 }
 skills = skills.substring(0,skills.length-1);
}
var skillsquery="";
if(skills!="")
{
    skillsquery ="r.skillSet in ("+skills+")";
}
else{
    skillsquery="''=''"
}


       var querySpec = {
           //query: 'Select * from root r where ('+skillsquery+ ')', 
    query: 'Select * from root r where((@qualification="" or r.qualification=@qualification) AND (@name="" or r.firstName=@name) AND (@telephone="" or r.telephone=@telephone) AND (@currentlyworking="" or r.currentEmployer=@currentlyworking) AND (r.experience>=@exp) AND ('+skillsquery+ ') )',    
              
// query: 'Select * from root r where((@qualification="" or r.qualification=@qualification) AND (@name="" or r.firstName=@name) AND (@telephone="" or r.telephone=@telephone) AND (@ratingininterview="" or r.Rating=@ratingininterview) AND (@currentlyworking="" or r.CurrentlyWorking=@currentlyworking) AND (r.Experience>=@exp) AND ('+skillsquery+ ') )',    
 
       
       // query: 'Select * from root r where(@qualification="" or r.Qualification=@qualification) AND (r.Name=@name or @name="") AND(@skillset="" or r.SkillSet=@skillset) AND (@telephone="" or r.Telephone=@telephone) AND (@ratingininterview="" or r.Rating=@ratingininterview) AND //(@currentlyworking="" or r.Rating=@currentlyworking) AND (r.Experience>=@exp) AND ( stringToDate("12-08-2015","mm-dd-yyyy","-") between stringToDate("12-01-2015","mm-dd-yyyy","-") AND stringToDate("12-31-2015","mm-dd-yyyy","-"))',
        parameters:[{
            name:'@name',
            value:queryObject.name
        },
        {
            name:'@qualification',
            value:queryObject.qualification
        },
        {
            name:'@telephone',
            value:queryObject.telephone
        },
         {
            name:'@ratingininterview',
            value:queryObject.ratingininterview
        },
         {
            name:'@skills',
            value:skills
        },
        {
            name:'@currentlyworking',
            value:queryObject.currentlyworking
        },
        {
            name:'@exp',
            value:parseFloat(queryObject.exp)
        }]
        
    };
    
    
    var db = "dbs/" + databaseId + "/colls/" + collectionId;

    client.queryDocuments(db, querySpec).toArray(function (err, results) {
        if (err) {
            throw (err);
        }        
       res.send(results);
        res.render('layout', { title: 'Analytical and Aptitude Test', content: results });
    });
}