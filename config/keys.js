//keys.js - figure out what set of credentials to return

//Node.js applications now default to NODE_ENV=production
if (process.env.NODE_ENV === 'production'){
	module.exports = require('./prod');
}else{
	module.exports = require('./dev');
}

//just for test
