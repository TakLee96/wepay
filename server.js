var express = require("express");
var bodyParser = require("body-parser");
var setupRoutes = require('./route');
var cors = require('cors');

var app = express();

setupRoutes(app);
app.use(function(req, res, next){console.log("%s %s", req.method, req.url); next();});
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//Server Listening to Port
var server = app.listen((process.env.PORT || 5000), function(){
app.use(cors({
  origin: '*',
  methods: ['GET', 'PUT', 'POST']
}));
app.use(express.static(__dirname + '/app/public'));
    console.log("server is running at %s", server.address().port);
});

module.exports = app;
