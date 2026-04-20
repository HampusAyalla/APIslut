//Importerar moduler som mysql
var mysql = require('mysql');
var express = require('express');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');

var app = express();
var http = require('http').Server(app);
var port = 5000;

app.use(express.json()); //Läsa Json request 

//Hemlig nyckel som man måste ha
const SECRET = "supersecretkey";

//Koppling till min databas (Som jag inte har än)
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "databasnamnet"
});

//Kopplar till databasen
con.connect(function(err) {
  if (err) throw err;
  console.log("Kopplad till databas");
});

//middleware, kollar om användaren har en token för att kolla om man ska kunna gå vidare
function auth(req, res, next) {
  const token = req.headers['mintoken']; //

  if (!token) {
    return res.status(401).json({ message: "Ingen token" });
  }

  jwt.verify(token, SECRET, function(err, decoded) {
    if (err) {
      return res.status(403).json({ message: "Ogiltig token" });
    }

    req.user = decoded; //Spara användaren 
    next();
  });
}


// Skapar ny användare
app.post("/users", async function(req, res) {
  const { username, password } = req.body;

  // Kolla så du skrivit namn o lösen
  if (!username || !password) {
    return res.status(400).json({ message: "Fyll i alla fält" });
  }

  // Hashar lösenordet
  const hash = await bcrypt.hash(password, 10);

};