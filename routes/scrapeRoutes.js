const express = require("express");
const Review = require("../models/Review");
const scrapeReviews = require("../indiamart_scraper/reviewScraper");

const router = express.Router();

// Get all reviews
router.get("/reviews", async (req, res) => {
    try {
        const reviews = await Review.find();
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: "Error fetching reviews" });
    }
});

// Scrape reviews from a given URL
router.post("/scrape", async (req, res) => {
    const { url } = req.body;
    if (!url || !url.startsWith("https://www.indiamart.com/")) {
        return res.status(400).json({ error: "Invalid or missing URL" });
    }

    try {
        console.log(`Scraping URL: ${url}`);
        const reviews = await scrapeReviews(url);

        if (reviews.length === 0) {
            return res.status(404).json({ message: "No reviews found" });
        }

        await Review.insertMany(reviews);
        res.json({ message: "Scraping and storing completed", data: reviews });
    } catch (error) {
        console.error("Scraping Error:", error);
        res.status(500).json({ error: "Error scraping data" });
    }
});

module.exports = router;
