const mysql = require("mysql2");

// 建立 MySQL 連線
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Jklop558",
  database: "eventDB",
});

// 連線 MySQL
db.connect((err) => {
  if (err) {
    console.error("❌MySQL 連線失敗：" + err.stack);
    return;
  }
  console.log("✅ MySQL 連線成功，連接 ID：" + db.threadId);
});

module.exports = db;
