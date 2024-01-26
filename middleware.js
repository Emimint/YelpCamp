const ExpressError = require( "./utils/ExpressError" );
const CampGround = require( "./models/campground" );
const {campgroundSchema, reviewSchema} = require( './schemas' );

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; // add this line
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}


module.exports.validateCampground = ( req, res, next ) => {
  const {error} = campgroundSchema.validate( req.body );
  
  if ( error ) {
    const errMessage = error.details.map( el => el.message ).join( ',' );
    throw new ExpressError( errMessage, 400 );
  } else {
    next();
  }
}

module.exports.isAuthor = async ( req, res, next ) => {
  const {id} = req.params;
  const campground = await CampGround.findById(id);
  if(!campground.author.equals(req.user._id)) {
      req.flash('error', 'You do not have permission to edit this campground!');
      return res.redirect(`/campgrounds/${campground.id}`);
  } 
  next();
}

module.exports.validateReview = ( req, res, next ) => {
  const {error} = reviewSchema.validate( req.body );
  
  if ( error ) {
    const errMessage = error.details.map( el => el.message ).join( ',' );
    throw new ExpressError( errMessage, 400 );
  } else {
    next();
  }
}