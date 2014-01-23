//-------------------------------------MIDDLEWARES

// middleware che controlla la sessione dell'utente. 
//Se c'è un utente in sessione viene automaticamente loggato, altrimenti rimandato alla pagina di login. 
//Eventualmente aggiungere anche i cookies
function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Nessun utente in sessione.';
    res.render('login', { msg: 'Nessun utente in sessione.'});
  }
}

function administrator(req, res, next) {
  if (req.session.user) {
    if (req.session.user.admin == 'yes')
      next();
    else{
      req.session.error = 'Utente in sessione non amministratore.';
      res.render('home', {titolo: 'TITOLO', msg: 'Utente in sessione non amministratore.'});
    }
  }
  else{
    req.session.error = 'Nessun utente in sessione.';
    res.render('home', {titolo: 'TITOLO', msg: 'Nessun utente in sessione.'});
  }
}

//-------------------------------------ROUTES
module.exports = function (app) {

  app.get('/', function (req, res){
    res.render('home', { titolo: 'TITOLO', msg: '' });
  });

  app.get('/restricted', restrict, function(req, res){
    res.render('restricted', { user: req.session.user });
  });

  app.get('/signup', function (req, res){
    res.render('signup', { msg: '', target: 'signup'});
  });

  app.post('/signup', function (req, res){
		var dbManagement = require('./dbManagement');
		dbManagement.insertUser(req.body.username, req.body.email, req.body.pwd, function(err){
			if(err)
				return err;
			res.render("home", { titolo: 'TITOLO', msg: 'Registrazione avvenuta' });
		});
  });

  app.get('/login', function (req, res){
  	res.render('login', {msg: ''});
  });

  app.post('/login', function (req, res){
  	var dbManagement = require('./dbManagement');
    dbManagement.authenticate(req.body.username, req.body.pwd, function (err, user){
      
      if (err){
        //utente non trovato
        res.render('login', {msg: err.toString()});      
      }
      else if (user){
        req.session.regenerate(function (){
          req.session.user = user;
          res.redirect('restricted');          
        });
      }
      else {
        //password non valida        
        res.render('login', {msg: err.toString()});
      }

    });
  	
  });

  app.get('/admin-signup', function (req, res) {
    res.render('signup', { msg: '', target: 'admin-signup' });
  });

  app.post('/admin-signup', function (req, res){
    var dbManagement = require('./dbManagement');
    dbManagement.insertAdmin(req.body.username, req.body.email, req.body.pwd, function(err){
      if(err)
        return err;
      res.render("home", { titolo: 'TITOLO', msg: 'Registrazione avvenuta' });
    });
  });

  app.get('/view', administrator, function (req, res){
    var dbManagement = require('./dbManagement');
    dbManagement.viewUsers(function(err, doc){
      if(err)
        return err;
      res.send(doc);
    });
  });

};