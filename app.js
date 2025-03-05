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

  let startTimeJson = JSON.stringify(startTime);
  let endTimeJson = JSON.stringify(endTime);

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
    // res.json({ message: "活動儲存成功" });
  });
});

app.delete("/delete/:id", (req, res) => {
  const eventId = req.params.id;
  const sql = "DELETE FROM `events` WHERE id = ?";

  db.query(sql, [eventId], (err, result) => {
    if (err) {
      return res.status(500).send({ error: err.message });
    }
    res.send({ message: "活動已刪除" });
  });
});

app.put("/all-events/:id", async (req, res) => {
  const eventId = req.params.id; // 取得舊的 id
  const {
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

  // 轉換 JSON 格式
  const startTimeJson = JSON.stringify(startTime);
  const endTimeJson = JSON.stringify(endTime);

  const deleteSql = `DELETE FROM events WHERE id = ?`;
  const insertSql = `
    INSERT INTO events (id, type, title, performer, img, location, startTime, endTime, description, duration)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    eventId, // 這裡應該使用 eventId，因為 id 不應該被更改
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

  try {
    // 先刪除舊資料
    const [deleteResult] = await db.promise().query(deleteSql, [eventId]);

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({ message: "找不到該活動，無法更新！" });
    }

    // 插入新資料
    const [insertResult] = await db.promise().query(insertSql, values);

    if (insertResult.affectedRows === 0) {
      return res.status(500).json({ message: "活動更新失敗，資料未被新增！" });
    }

    // res.json({ message: "活動更新成功！" });
  } catch (error) {
    res.status(500).json({ message: "更新失敗", error });
  }
});

// 儲存liked event
app.get("/liked-events", (req, res) => {
  db.query("SELECT * FROM `likedList`", (err, results) => {
    if (err) {
      console.err(err);
      return res.status(500).json({ message: "OH NO! form app.js" });
    }
    res.json(results);
  });
});
app.post("/liked-events", (req, res) => {
  const { eventID } = req.body;

  if (!eventID) {
    return res.status(400).json({ message: "缺少 eventID" });
  }

  const sql = `INSERT IGNORE INTO likedList (eventID) VALUES (?)`;

  db.query(sql, [eventID], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "加入失敗" });
    }
    // res.json({ message: "成功加入" });
  });
});
app.delete("/delete/liked-events/:id", (req, res) => {
  const eventId = req.params.id;
  const sql = "DELETE FROM `likedList` WHERE eventID = ?";

  db.query(sql, [eventId], (err, result) => {
    if (err) {
      return res.status(500).send({ error: err.message });
    }
    // res.send({ message: "移除我的最愛" });
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
