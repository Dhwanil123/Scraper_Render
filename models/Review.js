const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    name: String,
    location: String,
    date: String,
    product: String,
    rating: Number,
    reviewText: String
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
