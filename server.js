var express = require("express");
var bodyParser = require("body-parser");
var setupRoutes = require('./route');
var cors = require('cors');

var app = express();

app.use(cors());

app.use(express.static(__dirname + '/app/public'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

setupRoutes(app);

//Server Listening to Port
var server = app.listen((process.env.PORT || 5000), function(){
    console.log("server is running at %s", server.address().port);
});

module.exports = app;
