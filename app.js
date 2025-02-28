const express = require("express");

const db = require("./db"); //取得 db.js
// 讓網頁前端 port 和 server port不會因為不同 port 而除錯
const cors = require("cors");

const app = express();
const port = 3000;

//middle ware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/all-events", (req, res) => {
  db.query("SELECT * FROM `events`", (err, results) => {
    if (err) {
      console.err(err);
      return res.status(500).json({ message: "OH NO! form app.js" });
    }
    res.json(results);
  });
});

//儲存 data 到 mysql
app.post("/all-events", (req, res) => {
  console.log("收到 POST 請求:", req.body);

  const {
    id,
    type,
    title,
    performer,
    img,
    location,
    startTime,
    endTime,
    description,
    duration,
  } = req.body;

  if (!id || !title || !performer) {
    return res.status(400).json({ message: "缺少必要欄位" });
  }

  const startTimeJson = JSON.stringify(startTime);
  const endTimeJson = JSON.stringify(endTime);

  console.log("startTimeJson:", startTimeJson);
  console.log("endTimeJson:", endTimeJson);

  const sql = `
    INSERT INTO events (id, type, title, performer, img, location, startTime, endTime, description, duration)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      type = VALUES(type),
      title = VALUES(title),
      performer = VALUES(performer),
      img = VALUES(img),
      location = VALUES(location),
      startTime = VALUES(startTime),
      endTime = VALUES(endTime),
      description = VALUES(description),
      duration = VALUES(duration)
  `;

  const values = [
    id,
    type,
    title,
    performer,
    img,
    location,
    startTimeJson,
    endTimeJson,
    description,
    duration,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "活動儲存失敗" });
    }
    res.json({ message: "活動儲存成功" });
  });
});

//伺服器首頁
app.get("/", (req, res) => {
  res.send("🚀 伺服器運行中！");
});

// 啟動 Express 伺服器
app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 伺服器運行於 http://localhost:${port}`);
});
