const mongoose = require( "mongoose" );
const Schema = mongoose.Schema;

const reviewSchema = new Schema( {
    body: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    }
} );

module.exports = mongoose.model( "Review", reviewSchema );