var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

//schema degli "oggetti" nella collezione users del database
var UserSchema = new Schema(
  {
    "username" : String,    
    "salt" : String,
    "hash" : String,
    "admin" : String,
    "dati" : {
      "email" : String
    }
  }
);

var User = mongoose.model('User', UserSchema);

exports.connect = function () {
  //recupero i dati del database da file e mi connetto, con essi, al database
	require('fs').readFile('./dbParam.json', function (err, data) {
		if (err)
			return err;
		var opt = JSON.parse(data);
		//mongoose.connect('mongodb://localhost:27017/Auth', function(err){
    mongoose.connect('mongodb://'+opt.url+':'+opt.port+'/'+opt.db_name, function(err){  
			if (err)
				console.error('Impossibile connettersi al database');
			else
				console.log('Connessione al database');
		});
	});
}

exports.insertUser = function (username, email, pwd, callback) {
  //genero un salt e un hash dalla password fornita
  require('./pwd').hash(pwd, function(err, salt, hash){
    if(err)
      return err;

    var newUser = new User(
      {
        "username" : username,  
        "salt" : salt,
        "hash" : hash,
        "admin" : "no",
        "dati" : {
          "email" : email
        }
      }
    );
    //inserisco nel db l'utente creato.
    newUser.save(function (err){
      callback(err);      
    });

  });
}

exports.insertAdmin = function (username, email, pwd, callback) {
  //genero un salt e un hash dalla password fornita
  require('./pwd').hash(pwd, function(err, salt, hash){
    if(err)
      return err;

    var newUser = new User(
      {
        "username" : username,  
        "salt" : salt,
        "hash" : hash,
        "admin" : "yes",
        "dati" : {
          "email" : email
        }
      }
    );
    //inserisco nel db l'utente creato.
    newUser.save(function (err){
      callback(err);      
    });

  });
}

exports.viewUsers = function (callback){	
	User.find(function(err, items){    
		callback(err, items);
	});	
}

exports.authenticate = function (username, pwd, callback){
  User.findOne({"username":username}, function(err, user){
    if(!user)
      return callback(new Error('Utente non trovato.'));
    require('./pwd').hash(pwd, user.salt, function(err, hash){
      if(err)
        return callback(err);
      if(hash === user.hash)
        return callback(null, user);
      callback(new Error('Password non valida'));
    });
  });
}