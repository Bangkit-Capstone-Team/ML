const puppeteer = require("puppeteer");
const fs = require("fs"); // Import module untuk operasi berkas (file system)
const player = require("play-sound")((opts = {}));
const readline = require("readline");
const path = require("path");
const axios = require("axios");

let filename = "";
let browser;
let page;

const getData = async (filename) => {
  const lines = [];

  try {
    const fileStream = fs.createReadStream(filename);
    const readInterface = readline.createInterface({
      input: fileStream,
    });

    for await (const line of readInterface) {
      lines.push(line);
    }

    return lines;
  } catch (error) {
    throw error;
  }
};

const playSound = () => {
  player.play("assets/sound.mp3", function (err) {
    if (err) throw err;
  });
};

const saveToJSON = (data, filename) => {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(`data/${filename}.json`, jsonData, (err) => {
      if (err) {
        console.error("Error writing to JSON file:", err);
      } else {
        console.log("Data written to JSON file.");
      }
    });
  } catch (error) {}
};

let no = 1;

const scrapeInfo = async (link) => {
  try {
    await page.goto(link);
    await page.waitForSelector('div[data-testid="lstCL3ProductList"] > div');

    // Scroll ke bawah untuk memastikan semua konten dimuat
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const scrollInterval = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(scrollInterval);
            resolve();
          }
        }, 100);
      });
    });

    const cardContainers = await page.$$(
      'div[data-testid="lstCL3ProductList"] > div'
    );

    let card = [];

    for (const container of cardContainers) {
      let filename = `${no}.jpg`;
      const productDetail = await page.evaluate(
        async (container, filename) => {
          const anchor = container.querySelector(
            'a[data-testid="lnkProductContainer"]'
          );
          const titleElement = container.querySelector(".css-20kt3o");
          const imageElement = container.querySelector(".css-1g5og91 img");

          return {
            url: anchor ? anchor.href : null,
            title: titleElement ? titleElement.textContent : null,
            imageSrc: imageElement ? imageElement.src : null,
            filename,
          };
        },
        container,
        filename
      );

      card.push(productDetail);
      console.log(`[✔] Data : ${productDetail.title}`);

      // Download and save the image
      console.log(`[+] Download ${productDetail.imageSrc}`);
      if (productDetail.imageSrc) {
        const imagePath = path.join(`${__dirname}/data`, "images", filename);

        await downloadImage(productDetail.imageSrc, imagePath);
        console.log(`[✔] Image saved: data/${filename}`);
      }
      no++;
    }

    return card;
  } catch (error) {
    console.log(error);
    console.log("\n-------------- error scrape info -----------------\n");
    // main(false)
  }
};

const downloadImage = async (imageUrl, imagePath) => {
  try {
    const response = await axios({
      url: imageUrl,
      method: "GET",
      responseType: "stream",
    });

    response.data.pipe(fs.createWriteStream(`${imagePath}`));

    return new Promise((resolve, reject) => {
      response.data.on("end", () => resolve());
      response.data.on("error", (error) => reject(error));
    });
  } catch (error) {
    console.log(`[R] Try download again`);
  }
};

const setup = async () => {
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ["--window-size=1920,1080", "--disable-notifications"],
    });
    page = await browser.newPage();
    await page.setViewport({
      width: 1920,
      height: 1080,
    });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
    );
  } catch (error) {
    console.log(error);
    console.log("\n-------------- error setup -----------------\n");
    // main(false)
  }
  // console.log("allFeeds", allFeeds);
};

const main = async () => {
  const links = await getData("src/data/links.txt");
  await setup();
  let card = [];
  for (const link of links) {
    // get produk data
    card.push(await scrapeInfo(link));
    await page.waitForTimeout(7000);
  }
  saveToJSON(card, "label");
};

main();
