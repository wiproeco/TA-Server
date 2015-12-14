var config = {}

var nconf = require('nconf');

// tell nconf which config file to use
nconf.env();
nconf.file({ file: 'config.json' });


config.host = nconf.get("HOST");
config.authKey = nconf.get("AUTH_KEY");
config.databaseId  = nconf.get("DATABASE");
config.collectionId = nconf.get("COLLECTION");


module.exports = config;