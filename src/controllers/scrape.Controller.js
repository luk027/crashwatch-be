import puppeteer from 'puppeteer';
import { User } from "../database/models/user.model.js";
import { Asset } from "../database/models/asset.model.js";

export const getSearchResults = async(req, res) => {
    const { searchQuery } = req.body;
    const userId = req.user._id;
    try {
      if (!searchQuery) {
        return res.status(400).json({ message: "Search query is required!" });
      }
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      }
      if (!user.isVerified) {
        return res.status(401).json({ message: "User not verified!" });
      }

      // Launch Puppeteer
      const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      // Create a new page
      const page = await browser.newPage();
      // 🚫 Block unnecessary resources
      await page.setRequestInterception(true);
      page.on("request", (req) => {
        const resourceType = req.resourceType();
        if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
      );
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto(`https://in.investing.com/search/?q=${searchQuery}`, {
        waitUntil: "domcontentloaded",
        timeout: 20000
      });
      await page.waitForSelector(".js-inner-all-results-quotes-wrapper", {
        timeout: 10000
      });

      // Wait for the data to load
      const result = await page.evaluate(() => {
        const scriptTag = Array.from(document.querySelectorAll("script")).find(
          (script) =>
            script.textContent.includes("window.allResultsQuotesDataArray")
        );

        const jsonMatch = scriptTag?.textContent.match(
          /window\.allResultsQuotesDataArray\s*=\s*(\[.*?\]);/
        );

        if (!jsonMatch) return [];

        const dataArray = JSON.parse(jsonMatch[1]);

        return dataArray.map(({ name, symbol, link, pair_type, isCrypto, flag }) => ({
            name,
            shortName: symbol,
            link: `https://in.investing.com${link}`,
            pairType: pair_type,
            isCrypto,
            country: flag,
        }));
      });

      await browser.close();
      res.status(200).json({
        success: true,
        message: "Search results fetched successfully!",
        data: result,
      });
    } catch (error) {
        console.log("Error While searching", error.message);
        res.status(500).json({ message: "Internal Server Error!" });
    }
}

export const getAssetDetails = async(req, res) => {

}
