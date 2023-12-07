const fs = require("fs").promises;
const path = require("path");
const { promisify } = require("util");
const exec = promisify(require("child_process").exec);
const mysql = require("mysql2");

const resetData = async () => {
  // Hapus semua file image di folder data/images/
  const imagesFolder = path.join(__dirname, "data", "images");
  await fs.rmdir(imagesFolder, { recursive: true });
  await fs.mkdir(imagesFolder);

  // Kosongkan tabel 'product' di database
  const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "dataset",
  });

  connection.connect();

  const clearTableQuery = "DELETE FROM product";
  connection.query(clearTableQuery, (error, results) => {
    if (error) {
      console.error("Error clearing product table:", error);
    } else {
      console.log("Product table cleared:", results);
    }

    connection.end();
  });
};

resetData();
