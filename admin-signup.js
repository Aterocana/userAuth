var dbMan = require('./logic/dbManagement');
var username = process.argv[2];
var pwd = process.argv[3];
var email = process.argv[4];

dbMan.connect();
dbMan.insertAdmin(username, email, pwd, function(err){
  if(err)
    return console.error(err);
  console.log('Registrazione avvenuta');
});