const express = require("express"); // 引入 express 模組
const app = express();
const port = 3305;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

const mysql = require("mysql2");
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Jklop558",
  database: "practice",
});

db.connect((err) => {
  if (err) {
    console.err("連線失敗：" + err.stack);
    return;
  }
  console.log("連線成功，連接ID:" + db.threadId);
});

db.query("SELECT * FROM `employee`", (err, results, fields) => {
  if (err) throw err;
  console.log("查詢結果:", results);
});

db.end();
