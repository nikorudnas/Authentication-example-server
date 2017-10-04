var bodyParser = require('body-parser');
var express = require('express');
const app = express();
var mongoose = require('mongoose');
var morgan = require('morgan');
var http = require('http');
var cors = require('cors');
var path = require('path');

var constants = require('./constants');

// CORS enabled
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// logging with morgan
app.use(morgan('dev'));

// Server avatars
app.use('/uploads', express.static(path.join(__dirname + '/uploads')));

// connect to database
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/' + constants.DB_name, {
    useMongoClient: true
})
    .then(() => console.log('Database connection succesful'))
    .catch((err) => console.error(err));

// require apiRoutes
var apiRoutes = require('./routes/api');
app.use('/api/', apiRoutes);

http.createServer(app).listen(constants.SERVER_PORT, function () {
    console.log('Server listening on port: ' + constants.SERVER_PORT);
});