var mysql = require('mysql');
var express = require('express');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');

var app = express();
var http = require('http').Server(app);
var port = 5000;

app.use(express.json());

const SECRET = "supersecretkey";

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "databasnamnet"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Kopplad till databas. ");
});
