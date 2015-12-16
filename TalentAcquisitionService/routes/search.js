
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
var moment = require('moment');
moment().format();

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


exports.Search=function(req,res){
    var skillsquery="contains";
var skills="";
var namequery="contains";
   var url = require('url') ;
   var queryObject = url.parse(req.url,true).query;
if(queryObject.name==undefined)
{
   queryObject.name="";
    namequery="''=''";
}else{
    namequery=namequery+"(r.fullName,'"+queryObject.name+"')";
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
if(queryObject.fromdate==undefined || queryObject.fromdate=="")
{
    queryObject.fromdate="";
}
else
{
    queryObject.fromdate=moment(queryObject.fromdate,"M/D/YYYY H:mm").valueOf()
}

if(queryObject.todate==undefined || queryObject.todate=="")
{
    queryObject.todate="";
}
else
{
    //moment().add(1, 'days').valueOf();
   // queryObject.todate=moment(queryObject.todate,"M/D/YYYY H:mm").valueOf()
   queryObject.todate=moment(queryObject.todate,"M/D/YYYY H:mm").add(1, 'days').valueOf()




}



// if(skills.length>0)
// {
// var skillResult=skills.split(',');
//    skills="";
//  for (var i = 0; i < skillResult.length; i++) {
//      skills = skills+"\""+ skillResult[i].toString() +"\",";
//  }
//  skills = skills.substring(0,skills.length-1);
// }
// var skillsquery="";
// if(skills!="")
// {
//     skillsquery ="r.skillSet in ("+skills+")";
// }
// else{
//     skillsquery="''=''"
// }

if(skills.length>0)
{
var skillResult=skills.split(',');
for (var i = 0; i < skillResult.length; i++) {
     skillsquery=skillsquery+" (r.skillSet,'"+skillResult[i]+"')"+" OR contains";
}
skillsquery = skillsquery.substr(0,skillsquery.length-12);
}else{
    skillsquery="''=''"
}



       var querySpec = {
         // query: 'Select * from root r where '+namequery+' and ('+skillsquery+ ')', 
          query: 'Select * from root r where '+namequery+' and ((r.registeredDate between @fromdate and @todate) and (@qualification="" or r.qualification=@qualification) AND (@telephone="" or r.telephone=@telephone)  AND (r.experience>=@exp)  AND (@currentlyworking="" or r.currentEmployer=@currentlyworking) AND ('+skillsquery+ ') )',

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
            name:'@fromdate',
            value:queryObject.fromdate
        },
        {
            name:'@todate',
            value:queryObject.todate
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