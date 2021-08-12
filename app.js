const express = require('express');
const app = express();
var cors = require('cors');
const path = require('path')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
//dotenv configuration
dotenv.config();
const morgan = require('morgan');
//--- importing all sort of routes

const authRoutes = require('./routes/auth');
const taskRoutes=require('./routes/task')
const passport = require('passport');
const uuid = require('uuid');
// var session = require('express-session');

app.use(passport.initialize());
//Database Connectivity
mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
}).then(() => {
      console.log("Database Connected Successfully!")
}).catch((error) => {
      console.log("Error in connectivity: " + error)
});

//if the error comes after database is connected
mongoose.connection.on("error", err => {
      console.log(`DB Connection Error: ${err.message}`)
})

//middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(expressValidator());
// app.use(session({
//       name: 'SessionCookie',
//       genid: function (req) { return uuid.v4() },
//       secret: process.env.SECRET_KEY,
//       resave: false,
//       saveUninitialized: false,
//       cookie: { secure: false, expires: 60000 }

// }))
// app.use(passport.initialize());
// app.use(passport.session());
app.get("/", (req, res) => {
      return res.status(200).json({ message: "server is working sucessfully: 13th commit" });
})

app.use('/', authRoutes,taskRoutes);



//sends all the data when require sign-in runs so creating custom message for that error
app.use(function (err, req, res, next) {
      if (err.name === "UnauthorizedError") {
            res.status(401).json({ error: "Unauthorized Request" });
      }
});

//server created
const port = process.env.PORT || 4000;
app.listen(port, () => { console.log(`Server Running at port: ${process.env.PORT}`) });

//process.on('SIGINT', () => { console.log("Bye bye!"); process.exit(); });
//git push heroku master
//heroku git:remote -a grc-portal
//git push heroku master
//heroku ps:restart	--app grc-portal
