const express = require( 'express' );
const router = express.Router({ mergeParams: true });
const catchAsync = require( '../utils/catchAsync' );
const CampGround = require( "../models/campground" );
const Review = require( "../models/review" );
const {validateReview} = require( '../middleware' );



// Route to create a new review for a specific campground: 
router.post( "/", validateReview, catchAsync(async ( req, res ) => {
    const { id } = req.params;
  const campground = await CampGround.findById( id );
  const review = new Review(req.body.review);
  await review.save();
  campground.reviews.push(review);
  await campground.save();
  req.flash('success', 'Created new review!');
  res.redirect(`/campgrounds/${id}`)
} ) );

router.delete( "/:reviewId", catchAsync( async ( req, res ) => {
  const { id, reviewId } = req.params;
  await CampGround.findByIdAndUpdate( id, {$pull:{reviews: reviewId}} )
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'Successfully deleted review')
  res.redirect(`/campgrounds/${id}`);
} ) )

module.exports = router;
