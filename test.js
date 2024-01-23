const express = require('express')
const app = express()

const verifyPassword =  ( req, res, next ) => {
  const { password } = req.query;
  if(password === "shazam")
  {
    console.log( "yaayy!" ); 
    next();
  }
  else
    throw new Error( "You need a password" );
}

app.get( "/", ( req, res ) => {
  res.send( "home!" );
} );

app.get( "/error", ( req, res ) => {
  chicken.fly();
} );

app.get( "/dogs", ( req, res ) => {
  res.send( "woof!" );
} );

app.get( "/secret", verifyPassword, ( req, res ) => {
  res.send( "I have hidden chocolate under the cupboard." );
} );

app.use((req, res, next) => {
  res.send( 'Not found.' );
} )

app.use(( err, req, res, next )=>{ 
  console.log( "================================" );
  console.log( "================================" );
  console.log( "================================" );
  console.log( err.message );
  next(err);
} );


app.listen(3000, () => {
  console.log("Serving on port 3000.");
});
