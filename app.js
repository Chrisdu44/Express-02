require("dotenv").config();

const path = require("path");
const express = require("express");
const Session = require('express-session');
const FileStore = require('session-file-store')(Session);
const movieHandlers = require("./movieHandlers");
const userHandlers = require("./userHandlers");

const { validateMovie } = require("./validators.js");
const { validateUser } = require("./validators.js");
const { hashPassword, verifyPassword, verifyToken } = require("./auth");
const { nextTick } = require("process");

const app = express();

app.use(express.json());
app.use(Session({
  store: new FileStore({
      path: path.join(__dirname, '/tmp'),
      encrypt: true
  }),
  secret: 'Super Secret !',
  resave: true,
  saveUninitialized: true,
  name : 'sessionId'
}));

const port = process.env.APP_PORT ?? 5000;

const welcome = (req, res) => {
  res.send("Welcome to my favourite movie list");
};

app.get("/", welcome);

app.get("/session-in", (req, res) => {
  req.session.song = "be bop a lula";
  res.send('coucou');
});
app.get("/session-out", (req, res) => {
  res.send(req.session.song);
});

//the public routes
app.get("/api/movies", movieHandlers.getMovies);
app.get("/api/movies/:id", movieHandlers.getMovieById);
app.get("/api/users", userHandlers.getUsers);
app.get("/api/users/:id", userHandlers.getUserById);

app.post("/api/users", hashPassword, userHandlers.postUser);
app.post("/api/login", userHandlers.getUserByEmailWithPasswordAndPassToNext, verifyPassword);

// app.use(verifyToken);

// the private routes
app.post("/api/movies", verifyToken, movieHandlers.postMovie);

app.put("/api/movies", validateMovie, movieHandlers.updateMovie);
app.put("/api/movies/:id", validateMovie, movieHandlers.updateMovie);
app.put("/api/users", validateUser, userHandlers.updateUser);
app.put("/api/users/:id", validateUser, userHandlers.updateUser);

app.delete("/api/movies/:id", movieHandlers.deleteMovie);
app.delete("/api/users/:id", userHandlers.deleteUser);

app.listen(port, (err) => {
  if (err) {
    console.error("Something bad happened");
  } else {
    console.log(`Server is listening on ${port}`);
  }
});