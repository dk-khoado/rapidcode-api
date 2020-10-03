var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var fileUpload = require('express-fileupload');
const rateLimit = require("express-rate-limit");
var MongoStore = require('rate-limit-mongo');
//db
const db = require('./models/indexDB');
const dbCFG = require('./models/config');

var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api/index');

var startService = require('./helpers/startService')
var app = express();


const limiter = rateLimit({
  store: new MongoStore({
    uri: `mongodb://${dbCFG.db.host}:${dbCFG.db.port}/${dbCFG.db.db_name}`,
    user: dbCFG.db.username,
    password: dbCFG.db.password
  }),
  windowMs: 15 * 60 * 1000, // 1 minutes
  max: 180, // limit each IP to 500 requests per windowMs
  message:
    "Too many accounts created from this IP, please try again after an hour"
});

//  apply to all requests
//app.use(limiter);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
  useTempFiles: true,
  tempFileDir: './public/temp',
}));


app.use('/', indexRouter);
app.use('/api', apiRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
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
