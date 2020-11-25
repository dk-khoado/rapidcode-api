var createError = require('http-errors');
var express = require('express');
var logger = require('morgan');
var cors = require('cors');
require('dotenv').config()
var fileUpload = require('express-fileupload');
const rateLimit = require("express-rate-limit");
var MongoStore = require('rate-limit-mongo');
const NodeCache = require("node-cache");
//db
const db = require('./models/indexDB');
const dbCFG = require('./models/config');

var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api/index');

// var startService = require('./helpers/startService')

const customCache = new NodeCache({ stdTTL: 300, checkperiod: 600, useClones: false });

var app = express();

const limiter = rateLimit({
    store: new MongoStore({
        uri: `mongodb://${dbCFG.db.host}:${dbCFG.db.port}/${dbCFG.db.db_name}`,
        user: dbCFG.db.username,
        password: dbCFG.db.password
    }),
    windowMs: 15 * 60 * 1000, // 1 minutes
    max: 500, // limit each IP to 500 requests per windowMs
    message: "Too many accounts created from this IP, please try again after one minutes"
});

app.locals.cache = customCache
app.disable('x-powered-by');
//  apply to all requests
// app.use(limiter);
// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles: true,
    tempFileDir: './public/temp',
}));


app.use('/', indexRouter);
app.use('/api', apiRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.status(404).send(require("./function/response")(null, false, 404, null, "NOT FOUND"))
});


module.exports = app;