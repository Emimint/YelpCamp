const express = require("express");
const path = require("path");
const mongoose = require( "mongoose" );
const ejsMate = require( "ejs-mate" );
const ExpressError = require( "./utils/ExpressError" );
const methodOverride = require("method-override");
const campgrounds = require( "./routes/campgrounds" );
const reviews = require( "./routes/reviews" );

mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp")
  .then(() => {
    console.log("Connected to Yelp-Camp");
  })
  .catch((err) => {
    console.log("Connection to the Yelp-Camp failed: ", err);
  });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set( "views", path.join( __dirname, "views" ) );

app.use( express.urlencoded( { extended: true } ) );
app.use( methodOverride( "_method" ) );
app.use( express.static( path.join( __dirname, "public" ) ) );

app.use( "/campgrounds", campgrounds );
app.use("/campgrounds/:id/reviews", reviews);

// Main route:
app.get("/", (req, res) => {
  res.render('home', { what: 'best', who: 'me' });
} );


app.all( "*", ( req, res, next ) => { 
  next(new ExpressError( "Page not found", 404 ));
} )

app.use( ( error, req, res, next ) => { 
  const { status = 500, message = "Something went wrong!" } = error;
  // if(!error.status) error.status = 500;
  res.status( status ).render("error", { error });
} )

app.listen(3000, () => {
  console.log("Serving on port 3000.");
});