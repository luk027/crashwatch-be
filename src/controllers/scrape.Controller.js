import puppeteer from "puppeteer";
import pLimit from "p-limit";
import { User } from "../database/models/user.model.js";

const CONCURRENCY = 5; // Number of parallel pages
const limit = pLimit(CONCURRENCY);

const launchBrowser = async () => {
  return puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
};

const setupPage = async (browser) => {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const blocked = ["image", "stylesheet", "font", "media"];
    blocked.includes(req.resourceType()) ? req.abort() : req.continue();
  });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
  );
  await page.setViewport({ width: 1280, height: 800 });
  return page;
};

export const getSearchResults = async (req, res) => {
  const { searchQuery } = req.body;
  const userId = req.user._id;

  try {
    if (!searchQuery)
      return res.status(400).json({ success: false, message: "Search query is required!" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found!" });
    if (!user.isVerified) return res.status(401).json({ success: false, message: "User not verified!" });

    const browser = await launchBrowser();
    const page = await setupPage(browser);

    await page.goto(`https://in.investing.com/search/?q=${encodeURIComponent(searchQuery)}`, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });

    await page.waitForSelector(".js-inner-all-results-quotes-wrapper", { timeout: 10000 });

    const result = await page.evaluate(() => {
      const scriptTag = Array.from(document.querySelectorAll("script")).find((script) =>
        script.textContent.includes("window.allResultsQuotesDataArray")
      );

      const jsonMatch = scriptTag?.textContent.match(
        /window\.allResultsQuotesDataArray\s*=\s*(\[.*?\]);/
      );
      if (!jsonMatch) return [];

      const dataArray = JSON.parse(jsonMatch[1]);

      return dataArray.map(({ name, symbol, link, pair_type, isCrypto }) => ({
        name,
        shortName: symbol,
        link: `https://in.investing.com${link}`,
        pairType: pair_type,
        isCrypto,
      }));
    });

    await browser.close();
    res.status(200).json({
      success: true,
      message: "Search results fetched successfully!",
      data: result,
    });
  } catch (error) {
    console.error("Error While searching:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error!" });
  }
};

export const fetchUserAssetDetails = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId).populate({
      path: "watchlist",
      select: "link -_id",
    });

    if (!user) return res.status(404).json({ success: false, message: "User not found!" });
    if (!user.isVerified) return res.status(401).json({ success: false, message: "User not verified!" });

    const assetLinks = [...new Set(user.watchlist.map((asset) => asset.link))];

    if (assetLinks.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No assets found in watchlist!",
        data: [],
      });
    }

    const browser = await launchBrowser();
    const pages = await Promise.all(
      Array(CONCURRENCY).fill().map(() => setupPage(browser))
    );

    let nextPageIndex = 0;

    const scrapeAsset = async (link) => {
      const page = pages[nextPageIndex];
      nextPageIndex = (nextPageIndex + 1) % CONCURRENCY;

      try {
        await page.goto(link, { waitUntil: "domcontentloaded", timeout: 25000 });
        await page.waitForSelector(".instrument-price_last__KQzyA", { timeout: 8000 });

        const details = await page.evaluate(() => {
          const getText = (selector) =>
            document.querySelector(selector)?.textContent.trim() || "N/A";

          return {
            name: getText("h1"),
            currentPrice: getText(".instrument-price_last__KQzyA"),
            change: getText(".instrument-price_change-value__jkuml"),
            dayRange: getText('td[data-test="range"]'),
            technicalSummary: getText(".technicalSummaryTbl .summary span"),
          };
        });

        return details;
      } catch (err) {
        console.error(`Error scraping ${link}:`, err.message);
        return { name: link, error: "Failed to fetch data" };
      }
    };

    const assetDetails = await Promise.all(
      assetLinks.map((link) => limit(() => scrapeAsset(link)))
    );

    await Promise.all(pages.map((page) => page.close()));
    await browser.close();

    res.status(200).json({
      success: true,
      message: "Asset details fetched successfully!",
      data: assetDetails,
    });
  } catch (error) {
    console.error("Error While fetching asset details:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error!" });
  }
};
