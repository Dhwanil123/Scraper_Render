const puppeteer = require("puppeteer");

async function scrapeReviews(url) {
    if (!url) throw new Error("URL is required");

    let browser;
    try {
        browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            headless: "new"
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");

        await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });

        await page.waitForSelector(".FM_rvwC.FM_w3", { timeout: 30000 });

        console.log("Page loaded, starting scraping...");

        for (let i = 0; i < 3; i++) {
            try {
                const loadMoreButton = await page.$("#rat_more");
                if (!loadMoreButton) break;

                await Promise.all([loadMoreButton.click(), page.waitForTimeout(2000)]);
            } catch (loadMoreError) {
                console.log("No more reviews to load or error loading:", loadMoreError);
                break;
            }
        }

        const reviews = await page.evaluate(() => {
            const reviewElements = document.querySelectorAll(".FM_rvwC.FM_w3");
            return Array.from(reviewElements).map(review => ({
                name: review.querySelector(".FM_f17 span:first-child")?.innerText.trim() || "N/A",
                location: review.querySelector(".FM_f17 span:nth-child(3)")?.innerText.trim() || "N/A",
                date: review.querySelector(".FM_f16 span:first-child")?.innerText.trim() || "N/A",
                product: review.querySelector(".FM_f16 span:nth-child(3)")?.innerText.replace("Product Name : ", "").trim() || "N/A",
                rating: review.querySelector(".FM_flsRt.FM_pa") ? parseInt(review.querySelector(".FM_flsRt.FM_pa").style.width) / 20 : "N/A",
                reviewText: review.querySelector(".FM_m15.FM_C0")?.innerText.trim() || "N/A"
            }));
        });

        console.log(`Scraped ${reviews.length} reviews`);
        return reviews;
    } catch (error) {
        console.error("Scraping error:", error);
        throw new Error(`Error scraping the page: ${error.message}`);
    } finally {
        if (browser) {
            console.log("Closing browser");
            await browser.close();
        }
    }
}

module.exports = scrapeReviews;
