// load .env data into process.env
require("dotenv").config();

// Web server config
const PORT = process.env.PORT || 9080;
const sassMiddleware = require("./lib/sass-middleware");
const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const path = require('path');

// PG database client/connection setup
const { Pool } = require("pg");
const dbParams = require("./lib/db.js");
const db = new Pool(dbParams);
db.connect();

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["Pokemon"]
}));

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan("dev"));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(
  "/styles",
  sassMiddleware({
    source: __dirname + "/styles",
    destination: __dirname + "/public/styles",
    isSass: false, // false => scss, true => sass
  })//,
  // express.static("public")
);

app.use("/public", express.static(path.join(__dirname, "public")));

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const usersRoutes = require("./routes/users");
const pointsRoutes = require("./routes/points");
const flagsRoutes = require("./routes/flags");
const mapsRoutes = require("./routes/maps");
const widgetsRoutes = require("./routes/widgets");


// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/api/users", usersRoutes(db));
app.use("/api/widgets", widgetsRoutes(db));
app.use("/api/maps", mapsRoutes(db));
app.use("/points", pointsRoutes(db));
app.use("/flags", flagsRoutes(db));
// Note: mount other resources here, using the same pattern above

// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/maps", (req, res) => {
  res.render("maps");
});

app.get("/points", (req, res) => {
  res.render("points");
});

app.get("/users", (req, res) => {
  res.render("users");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
