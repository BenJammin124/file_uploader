//app.js
const express = require("express");
const session = require("express-session");
var passport = require("passport");
const path = require("node:path");
require("dotenv").config();
const flash = require("connect-flash");
const { prisma } = require("./config/client");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { indexRouter } = require("./routes/indexRouter");
const { authRouter } = require("./routes/authRouter");

const app = express();

//ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//static files (css/images)
const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

//body parser (makes data available in req.body)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//sessions
app.use(
  session({
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// initialize passport for authentication
require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.get("/favicon.ico", (req, res) => res.status(204));

app.use("/", authRouter);
app.use("/", indexRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).send(err.message);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
