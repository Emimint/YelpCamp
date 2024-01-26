const express = require( 'express' );
const router = express.Router();
const catchAsync = require( '../utils/catchAsync' );
const CampGround = require( "../models/campground" );
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');

// Route to display all campgrounds from the database:
router.get("/", async (req, res) => {
  const campgrounds = await CampGround.find({});
  res.render("campgrounds/index", { campgrounds });
});

// Route to create a new campground: 
router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
} );

router.post( "/", isLoggedIn, validateCampground, catchAsync(async ( req, res, next ) => {
  const campground = new CampGround(req.body.campground);
  campground.author = req.user._id;
  await campground.save();
  req.flash('success', 'Successfully made a new campground!');
  res.redirect( `/campgrounds/${campground._id}` );
} ));

// Route to get and display a specific campground:
router.get( "/:id", catchAsync(async ( req, res ) => {
  const {id} = req.params;
  const campground = await CampGround.findById(id);
    if (!campground) {
      req.flash('error', 'Cannot find that campground!');
      return res.redirect('/campgrounds');
  }
  // const campground = await CampGround.findById( req.params.id ).populate( 'reviews' ).populate( 'author' );
  res.render( "campgrounds/show", { campground } );
} ));


// Route to edit a specific campground:
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
  const {id} = req.params;
  const campground = await CampGround.findById(id);
  if (!campground) {
      req.flash('error', 'Cannot find that campground!');
      return res.redirect('/campgrounds');
  }

  res.render("campgrounds/edit", { campground });
} ));

router.put( "/:id", isLoggedIn, isAuthor, validateCampground, catchAsync(async ( req, res ) => {
  const campground = await CampGround.findByIdAndUpdate( req.params.id, req.body.campground);
  req.flash('success', 'Successfully updated campground!');
  res.redirect(`/campgrounds/${campground.id}`);
}));

router.delete( "/:id", isLoggedIn, isAuthor,  catchAsync(async ( req, res ) => {
  const campground = await CampGround.findByIdAndDelete( req.params.id );
  req.flash('success', 'Successfully deleted campground');
  res.redirect( "/campgrounds" );
} ) );


module.exports = router;