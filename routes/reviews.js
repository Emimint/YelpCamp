const express = require( 'express' );
const router = express.Router({ mergeParams: true });
const catchAsync = require( '../utils/catchAsync' );
const ExpressError = require( "../utils/ExpressError" );
const CampGround = require( "../models/campground" );
const Review = require( "../models/review" );
const { reviewSchema } = require( '../schemas' );

const validateReview = ( req, res, next ) => {
  const {error} = reviewSchema.validate( req.body );
  
  if ( error ) {
    const errMessage = error.details.map( el => el.message ).join( ',' );
    throw new ExpressError( errMessage, 400 );
  } else {
    next();
  }
}

// Route to create a new review for a specific campground: 
router.post( "/", validateReview, catchAsync(async ( req, res ) => {
    const { id } = req.params;
  const campground = await CampGround.findById( id );
  const review = new Review(req.body.review);
  await review.save();
  campground.reviews.push(review);
  await campground.save();
  res.redirect(`/campgrounds/${id}`)
} ) );

router.delete( "/:reviewId", catchAsync( async ( req, res ) => {
  const { id, reviewId } = req.params;
  await CampGround.findByIdAndUpdate( id, {$pull:{reviews: reviewId}} )
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/campgrounds/${id}`);
} ) )

module.exports = router;
