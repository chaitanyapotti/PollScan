var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const Web3 = require('web3');
const HDWalletProvider = require("truffle-hdwallet-provider");
// const testnet = `https://rinkeby.infura.io/v3/894765ed26c2470587b00e37249612e4`
const testnet = 'http://localhost:8545'

const provider = new HDWalletProvider(
  // "blue inherit drum enroll amused please camp false estate flash sell right", //potti's
  // process.env.ACCOUNT_WORDS,
  "rookie cross around replace trim garden before ancient manage arena bar rigid",
  testnet
);

web3 = new Web3(provider);
global.contractInstances = {}

var index = require('./routes/index');
var users = require('./routes/users');
var pollscan = require('./routes/pollscan');
var entity = require('./routes/entity');
var eoa  = require('./routes/eoa');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/', index);
app.use('/users', users);
app.use('/pollscan', pollscan);
app.use('/entity', entity);
app.use('/eoa', eoa);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
