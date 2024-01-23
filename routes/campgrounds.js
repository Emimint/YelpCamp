const express = require( 'express' );
const router = express.Router();
const catchAsync = require( '../utils/catchAsync' );
const ExpressError = require( "../utils/ExpressError" );
const CampGround = require( "../models/campground" );
const {campgroundSchema} = require( '../schemas' );


const validateCampground = ( req, res, next ) => {
  const {error} = campgroundSchema.validate( req.body );
  
  if ( error ) {
    const errMessage = error.details.map( el => el.message ).join( ',' );
    throw new ExpressError( errMessage, 400 );
  } else {
    next();
  }
}

// Route to display all campgrounds from the database:
router.get("/", async (req, res) => {
  const campgrounds = await CampGround.find({});
  res.render("campgrounds/index", { campgrounds });
});

// Route to create a new campground: 
router.get("/new", async (req, res) => {
  res.render("campgrounds/new");
} );

router.post( "/", validateCampground, catchAsync(async ( req, res, next ) => {
  const campground = new CampGround(req.body.campground);
  await campground.save();
  res.redirect( `/campgrounds/${campground._id}` );
} ));

// Route to get and display a specific campground:
router.get( "/:id", catchAsync(async ( req, res ) => {
  const campground = await CampGround.findById( req.params.id ).populate( 'reviews' );
  res.render( "campgrounds/show", { campground } );
} ));


// Route to edit a specific campground:
router.get("/:id/edit", catchAsync(async (req, res) => {
  const campground = await CampGround.findById( req.params.id );
  res.render("campgrounds/edit", { campground });
} ));

router.put( "/:id", validateCampground, catchAsync(async ( req, res ) => {
  const campground = await CampGround.findByIdAndUpdate( req.params.id, req.body.campground);
  res.redirect(`/campgrounds/${campground.id}`);
}));

router.delete( "/:id", catchAsync(async ( req, res ) => {
  const campground = await CampGround.findByIdAndDelete( req.params.id );
  res.redirect( "/campgrounds" );
} ) );


module.exports = router;