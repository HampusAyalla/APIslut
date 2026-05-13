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
  database: "restapislut"
});

//Kopplar till databasen
con.connect(function(err) {
  if (err) throw err;
  console.log("Kopplad till databas");
});

//middleware, kollar om användaren har en token för att kolla om man ska kunna gå vidare
function auth(req, res, next) {
  const token = req.headers['authorization'];

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

  // Lägger till användaren i databasen
  con.query(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hash],
    function(err, result) {
      if (err) {
        return res.status(500).json(err);
      } else {
        res.status(201).json({ message: "Användare skapad!" });
      }
    }
  );
});

// Hämta alla användare
app.get("/users", auth, function(req, res) {
  con.query("SELECT id, username FROM users", function(err, result) {
    if (err) {
      return res.status(500).json(err);
    }

    res.json(result);
  });
});

// Hämta användare med id
app.get("/users/:id", auth, function(req, res) {
  const userId = req.params.id;

  con.query("SELECT id, username FROM users WHERE id = ?", [userId], function(err, result) {
    if (err) {
      return res.status(500).json(err);
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Anävnade hittades inte" });
    }

    res.json(result[0]);
  });
});

//Logga in användare 
app.post("/login", function(req, res) {
  const { username, password } = req.body;

  con.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async function(err, result) {
      if (err) {
        return res.status(500).json(err);
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Användare hittades inte" });
      }

      // Kollar så lösenordet stämmer och skapar en token
      const user = result[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Fel lösenord" });
      }

      const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: "1h" });
      res.json({ token });
    }
  );
});

http.listen(port, function() {
  console.log("Server startad" + port);
});