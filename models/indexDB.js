var mongoose = require('mongoose');
var config = require('./config');

mongoose.set("useCreateIndex", true);
mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);
mongoose.set("useFindAndModify", false);

//connect db
// mongoose.connect('mongodb://localhost/test');
// mongoose.connect('mongodb://luanangame:Khoa!123@den1.mongo1.gear.host:27001/luanangame');
mongoose.connect(`mongodb://${config.db.username}:${config.db.password}@${config.db.host}:${config.db.port}/${config.db.db_name}`);
  
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("connect db success");
});

module.exports = db;
