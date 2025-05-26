

// adding project directory to search path of require()
require('app-module-path').addPath(__dirname);

// require and load .env
require('dotenv').config();

const cors = require('cors')

const express = require("express");
const app = express();
const multer = require('multer');
const morgan = require("morgan"); // used for logging because express.logger is deprecated.
const compression = require('compression')

const upload = multer()

// Routes
const webRoute = require("./routes/web");
const apiRoute = require("./routes/api");

const createError = require('http-errors');

app.use(compression())
app.use(cors())

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload.any())

app.use(morgan("tiny"));

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', ['GET', 'POST', 'OPTIONS', 'PUT']);
    res.append('Access-Control-Allow-Headers', ['Authorization', 'Content-Type']);
    next();
});

// Route Middlewares
app.use("/", webRoute);
app.use("/api", apiRoute);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

  // error handler
app.use(function(error, req, res, next) {

	const status = error.statusCode || 500;

	if(status == 404) {
		return res.status(404).send({"status": false, "message": "URL not found."})
	}
});

let port = process.env.APP_PORT || 3000

app.listen( port, () => {
	console.log(`Server running at port ${port}`);
});  