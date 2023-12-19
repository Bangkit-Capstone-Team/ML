const puppeteer = require("puppeteer");
const fs = require("fs");
const fs2 = require("fs").promises;
const readline = require("readline");
const path = require("path");
const axios = require("axios");
const mysql = require("mysql2");

let browser;
let page;
let no = 1;
let query;

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "dataset",
});

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
  } catch (error) {
    console.log("\n-------------- error -----------------\n");
    console.log(error);
    main(false);
  }
};

const insertIntoDatabase = async (product_name, data) => {
  const { title, image, image_real, link } = data;

  const sql = `INSERT INTO product (product_name, title, image, image_real, link) VALUES (?, ?, ?, ?, ?)`;
  const values = [product_name, title, image, image_real, link];

  connection.query(sql, values, (error, results) => {
    // if (error) {
    //   console.error("Error inserting into database:", error);
    // } else {
    //   console.log("Data inserted into the database:", results);
    // }
  });
};

const readQueriesFromFile = async (filePath) => {
  try {
    const content = await fs2.readFile(filePath, "utf-8");
    // Membagi isi file menjadi baris-baris dan membersihkannya dari spasi ekstra
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  } catch (error) {
    console.error("Gagal membaca file:", error);
    return [];
  }
};

// Fungsi untuk menulis data ke file JSON
const writeDataToJsonFile = async (data, filePath) => {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonData, "utf-8");
    console.log(`Data has been written to ${filePath}`);
  } catch (error) {
    console.error("Gagal menulis file JSON:", error);
  }
};

const getData = async (card) => {
  let name_el = await card.$('div[data-testid="spnSRPProdName"]');
  let name = "";
  if (name_el) {
    name = await name_el.evaluate((name_element) => name_element.innerText);
  }

  let image_el = await card.$('img[data-testid="imgSRPProdMain"]');
  let image_real = "";
  if (image_el) {
    image_real = await image_el.evaluate((element) =>
      element.getAttribute("src")
    );
  }

  let link_el = await card.$(".css-19oqosi a");
  let link = "";
  if (link_el) {
    link = await link_el.evaluate((element) => element.getAttribute("href"));
  }

  console.log(`[✔] Data : ${name}`);

  let filename;
  if (image_el) {
    console.log(`[+] Download ${image_real}`);
    filename = `${query}-${no}.jpg`;
    const imagePath = path.join(`${__dirname}/data`, "images", filename);
    await downloadImage(image_real, imagePath);
    console.log(`[✔] Image saved: data/${filename}`);
    no++;
  }

  return {
    title: name,
    image: filename,
    image_real,
    link,
  };
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
    console.log(`[R] Try download again : ${error}`);
    await downloadImage(imageUrl, imagePath);
  }
};

const main = async (state = true) => {
  const queries = await readQueriesFromFile("products.txt");

  if (state) {
    await setup();
  }
  let resultArray = [];
  for (let j = 5; j < 7; j++) {
    for (let pagination = 1; pagination < 5; pagination++) {
      console.log(`[P] Page ${pagination}`);
      query = queries[j];
      if (pagination == 1) {
        await page.goto(
          `https://www.tokopedia.com/search?st=&q=${encodeURIComponent(query)}`,
          (timeout = 30000 * 5)
        );
      }
      await page.waitForSelector('div[data-ssr="contentProductsSRPSSR"]');

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

      let card_el = await page.$$(
        'div[data-ssr="contentProductsSRPSSR"] .css-llwpbs'
      );
      const queryResult = [];
      for (let index = 0; index < card_el.length; index++) {
        let card = card_el[index];
        let data = await getData(card);
        queryResult.push(data);
        insertIntoDatabase(query, data);
      }
      resultArray.push();

      // Click the "Laman berikutnya" button if it doesn't have the "disabled" attribute
      const nextPageButton = await page.$(
        'button[aria-label="Laman berikutnya"]'
      );
      const isDisabled = await page.evaluate(
        (button) => button.hasAttribute("disabled"),
        nextPageButton
      );

      if (nextPageButton && !isDisabled) {
        await nextPageButton.click();
        // await page.waitForNavigation(); // Wait for the page to finish navigating
      } else {
        // Break out of the loop if the "Laman berikutnya" button is disabled or not found
        break;
      }
    }
    // console.log(resultArray.length);
    // return;
  }
  //   const outputFileName = "output.json";
  //   await writeDataToJsonFile(resultArray, outputFileName);
};

main(true);
