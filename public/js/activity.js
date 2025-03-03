const mainSection = document.querySelector("#event");
const mainTag = document.querySelector("main");
//上傳活動資訊
const submitBtn = document.querySelector(".open-button");
const eventForm = document.querySelector("form");
const eventType = document.getElementById("event-type");
const titleInput = document.getElementById("title-input");
const performer = document.getElementById("performer");
const startDate = document.getElementById("startDate");
const endDate = document.getElementById("endDate");
const locationInput = document.getElementById("location-input");
const descriptionInput = document.getElementById("description-input");
const imgInput = document.getElementById("img-input");
const previewImg = document.querySelector("#uploadedImage");

//日期
// event filter，選取filter 和 event-box
const filterType = document.getElementById("select-event-type");
const calender = document.getElementById("calender");

const openEditBoxBtn = document.querySelector(".open-edit-box");
const editBox = document.querySelector("#edit-box");
const modal = document.querySelector("#modal");
const closeBtn = document.querySelectorAll(".close-button");
const addBtn = document.querySelector("#add-event");
const addedEvent = document.querySelector(".added");
const modalImg = document.querySelector("#img1");
const modalBandName = document.querySelector("#band-name");
const modalperformerInfo = document.querySelector("#performer-info");
const modalShowInfo = document.querySelector("#show-time");
const showDStart = document.querySelector(".start");
const showDEnd = document.querySelector(".end");
const showTime = document.querySelector(".time");
const showLocate = document.querySelector(".location");

const modal2 = document.querySelector("#edit-event-box");
let allEvent = [];
let likedList = [];

async function getAllEvent() {
  try {
    const response = await fetch("http://localhost:3000/all-events");
    const data = await response.json();
    allEvent = data;
  } catch (err) {
    console.error('message: "OH NO!"');
  }
}

async function getLikedList() {
  try {
    const response = await fetch("http://localhost:3000/liked-events");
    const data = await response.json();
    likedList = data;
  } catch (err) {
    console.error('message:"Cannot fetch liked-list"');
  }
}
async function fetchAndLogEvents() {
  await getAllEvent(); // Await the result of getAllEvent()
  await getLikedList();
  updateEventBox();
  newEventBtn();
}

fetchAndLogEvents();

// flatpick function
const currentTime = new Date();

document.addEventListener("DOMContentLoaded", () => {
  let selectedDate = null;
  const formDate = {
    dateFormat: "Y/m/d H:i", //時間格式
    enableTime: true,
    time_24hr: true, //24 時制
    minuteIncrement: 15, //分鐘每次選擇間隔單位
    allowInput: true, //可輸入控制
    minDate: new Date().setMonth(new Date().getMonth() - 3),
    maxDate: new Date().setMonth(new Date().getMonth() + 6), //可選最大時間，從今天起一個月,
  };
  const filterDate = {
    dateFormat: "F Y", //時間格式
    allowInput: true, //可輸入控制
    minDate: new Date().setMonth(new Date().getMonth() - 7),
    maxDate: new Date().setMonth(new Date().getMonth() + 12), //可選最大時間，從今天起一個月,
    plugins: [
      new monthSelectPlugin({
        shorthand: true, //defaults to false
        altFormat: "F Y", //defaults to "F Y"
        theme: "dark", // defaults to "light"
      }),
    ],
  };
  if (
    calender &&
    startDate &&
    endDate
    // &&
    // !calender._flatpickr &&
    // !startDate._flatpickr &&
    // !endDate._flatpickr
  ) {
    flatpickr(calender, filterDate);
    flatpickr(startDate, formDate);
    flatpickr(endDate, formDate);
  } else {
    console.error("Flatpickr initialization failed: Element not found.");
  }
});

//存在 localStorage
// let allEvent = JSON.parse(localStorage.getItem("myEvent")) || [];
// let likedList = JSON.parse(localStorage.getItem("myList")) || [];

let currentTask = {};

//活動編輯器
openEditBoxBtn.addEventListener("click", () => {
  editBox.show();
});
closeBtn[0].addEventListener("click", (e) => {
  editBox.close();
});
addBtn.addEventListener("click", (e) => {
  const editTitle = document.querySelector(".top > p");
  closeBtn[1].innerText = "取消";
  submitBtn.innerText = "完成";
  editTitle.innerText = "新增活動";
  eventForm.reset();
  modal2.show();
});
closeBtn[1].addEventListener("click", (e) => {
  modal2.close();
});
submitBtn.addEventListener("click", () => {
  addOrUppdateEvent();
});

filterType.addEventListener("change", (e) => {
  filterBox(e);
});

calender.addEventListener("change", (e) => dayFilter(e));

//篩選活動類型
async function filterBox(e) {
  await getAllEvent();
  let eventBox = document.querySelectorAll(".event-box");
  let selected = document.querySelector(".active");

  selected.classList.remove("active");
  e.target.selectedOptions[0].classList.add("active");

  //---開始篩選---
  eventBox.forEach((eventBox) => {
    eventBox.classList.add("hide");
    if (
      eventBox.dataset.name === e.target.selectedOptions[0].id ||
      e.target.selectedOptions[0].id === "all-type"
    ) {
      eventBox.classList.remove("hide");
    }
  });
}
async function dayFilter(e) {
  await getAllEvent();
  let eventBox = document.querySelectorAll(".event-box");
  let selectedYear = calender._flatpickr.latestSelectedDateObj.getUTCFullYear();
  let selectedMonth = (calender._flatpickr.latestSelectedDateObj.getMonth() + 1)
    .toString()
    .padStart(2, 0);

  if (selectedMonth === "01") {
    selectedYear += 1;
  }
  selectedYear.toString();

  eventBox.forEach((eventBox) => {
    let eventSYM = eventBox.id.slice(0, 6);
    let eventEYM = eventBox.id.slice(9, 15);

    eventBox.classList.add("hide");
    //篩選當月當日及多日活動
    if (
      eventSYM === selectedYear + selectedMonth || //當日活動
      (eventBox.children[2].children[2].classList.length !== 3 && // 多日活動
        eventSYM <= selectedYear + selectedMonth &&
        eventEYM >= selectedYear + selectedMonth)
    ) {
      eventBox.classList.remove("hide");
    }
  });
}

//壓縮圖片
function compressImg(file, callback) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e) => {
    const img = new Image();
    img.src = e.target.result;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // 設定縮小的寬度和高度
      const maxWidth = 800;
      const maxHeight = 800;
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        const scale = Math.min(maxWidth / width, maxHeight / height);
        width *= scale;
        height *= scale;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // 轉成 Base64 (壓縮品質 0.7)
      const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
      callback(compressedBase64);
    };
  };
}

imgInput.addEventListener("change", (e) => {
  const newImg = e.target.files[0];

  if (newImg && newImg.type.startsWith("image/")) {
    compressImg(newImg, (compressedBase64) => {
      previewImg.src = compressedBase64; // 預覽圖片
      imgInput.src = `../public/image/${newImg.name}`;
      previewImg.style.display = "block";

      console.log("壓縮後的圖片:", imgInput.src); // 儲存到 MySQL
    });
    // const reader = new FileReader();
    // reader.onload = (e) => {
    //   imgInput.src = e.target.result;
    //   previewImg.src = imgInput.src;
    //   previewImg.style.display = "block";
    // };

    // reader.readAsDataURL(newImg);
  } else {
    console.log("請提供有效的圖檔");
    previewImg.style.display = "none";
  }
});

async function addOrUppdateEvent() {
  await getAllEvent();
  const EventArrIndex = allEvent.findIndex(
    (item) => item.id === currentTask.id
  );

  const eventObj = {
    type: eventType.selectedOptions[0].dataset.name,
    title: titleInput.value.trim(),
    performer: performer.value.trim(),
    get id() {
      if (this.startTime.date === this.endTime.date) {
        //單日活動ID
        return (
          this.startTime.date +
          this.type[0].toUpperCase() +
          this.performer.split(" ")[0]
        );
      } else {
        //多日活動ID
        return (
          this.startTime.date +
          "-" +
          this.endTime.date +
          this.type[0].toUpperCase() +
          this.performer.split(" ")[0]
        );
      }
    },
    img: imgInput.src,
    location: locationInput.value.trim(),
    //month, day
    startTime: {
      fullTime: startDate._flatpickr.latestSelectedDateObj,
      month: startDate._flatpickr.latestSelectedDateObj.getMonth() + 1 + "月",
      day: startDate._flatpickr.latestSelectedDateObj.getDate(),
      date: startDate.value.split(" ")[0].split("/").join(""),
      time: startDate.value.split(" ")[1],
    },
    endTime: {
      fullTime: endDate._flatpickr.latestSelectedDateObj,
      month: endDate._flatpickr.latestSelectedDateObj.getMonth() + 1 + "月",
      day: endDate._flatpickr.latestSelectedDateObj.getDate(),
      date: endDate.value.split(" ")[0].split("/").join(""),
      time: endDate.value.split(" ")[1],
    },
    description: descriptionInput.value.trim(),

    //確認是否為一日活動
    get duration() {
      return this.startTime.date === this.endTime.date;
    },
  };
  const { startTime, endTime } = eventObj;
  startTime.fullTime = startTime.fullTime.toISOString();
  endTime.fullTime = endTime.fullTime.toISOString();

  if (endTime.fullTime <= startTime.fullTime) {
    alert("結束時間需晚於開始時間");
    return;
  }

  if (EventArrIndex === -1) {
    const response = await fetch("http://localhost:3000/all-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventObj),
    });
    const result = await response.json();
    alert(result.message);
    // allEvent.push(eventObj); //新增在尾端
  } else {
    //更改 mysql 中的該筆資料
    const updateResponse = await fetch(
      `http://localhost:3000/all-events/${currentTask.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventObj),
      }
    );

    const updateResult = await updateResponse.json();
    alert(updateResult.message);
    // allEvent[EventArrIndex] = eventObj;
    modal2.close();
  }

  // localStorage.setItem("myEvent", JSON.stringify(allEvent));
  //發送資料 backend

  allEvent = mergeSort(allEvent);
  updateEventBox(); //main.append
  newEventBtn();
  eventForm.reset(); //表單送出後清空form;
}

async function updateEventBox() {
  await getAllEvent();

  allEvent = mergeSort(allEvent);

  mainSection.innerHTML = "";

  // 新增的event 出現在網頁上
  allEvent.forEach((eventObj) => {
    const {
      type,
      title,
      id,
      img,
      location,
      startTime,
      endTime,
      description,
      duration,
    } = eventObj;
    const divEventBox = document.createElement("div");
    divEventBox.className = "event-box";
    divEventBox.setAttribute("id", "event-box");
    const divPerformerInfo = document.createElement("div");
    divEventBox.setAttribute("id", `${id}`);
    const divEventDate = document.createElement("div");
    divEventDate.className = "event-date";
    const divEventInfo = document.createElement("div");
    divEventInfo.className = "event-info";

    divEventBox.setAttribute("data-name", `${type}`);

    divEventBox.innerHTML = `<div class="filter"></div><div class="div-image"><img class="event-image" src="${img}" alt="${title}" /></div>`;
    divPerformerInfo.innerHTML = `<p class="description hide">${description}</p>`;
    divEventDate.innerHTML = `<p class="month start" >${startTime.month}</p>
<p class="day start">${startTime.day}</p>
<p class="month end">${endTime.month}</p>
    <p class="day end">${endTime.day}</p>`;
    divEventInfo.innerHTML = `<p class="performance">${title}</p>
              <br />
              <p class="location">${location}</p>
              <br />
              <p class="time"><i class="fa-solid fa-clock"></i>    ${startTime.time}-${endTime.time}
              </p>`;

    if (duration) {
      divEventDate.children[2].classList.add("hide");
      divEventDate.children[3].classList.add("hide");
    }

    divEventBox.append(divEventDate);
    divEventBox.append(divPerformerInfo);
    divEventBox.append(divEventInfo);
    mainSection.append(divEventBox);
  });
}

async function newEventBtn() {
  await getAllEvent();
  allEvent = mergeSort(allEvent);

  addedEvent.innerHTML = "";
  allEvent.forEach((eventObj) => {
    let editEventDiv = document.createElement("div");
    editEventDiv.setAttribute("id", `${eventObj.id}`);
    editEventDiv.className = "edit-event-div";
    let addTrashBtn = document.createElement("span");
    addTrashBtn.className = "trashBtn";
    addTrashBtn.innerHTML = `<i class="fa-solid fa-trash"></i>`;
    let eventBtn = document.createElement("button");
    eventBtn.className = "eventBtn";
    eventBtn.innerHTML = ` <i class="fa-solid fa-angles-right"></i>    ${eventObj.title}`;
    eventBtn.id = eventObj.id;
    editEventDiv.append(eventBtn);
    editEventDiv.append(addTrashBtn);
    addedEvent.append(editEventDiv);

    // 點開每個活動按鈕，出現編輯表格
    eventBtn.addEventListener("click", showEventForm);

    //修改功能
    eventBtn.addEventListener("click", editEventForm);

    //刪除功能
    addTrashBtn.addEventListener("click", deleteEvent);
  });
}
// 每個 eventBox 點開，都會觸發modal

mainSection.addEventListener("click", (e) => {
  if (e.target.parentElement.classList.value === "event-box") {
    clickBox(e);
  }
});
closeBtn[2].addEventListener("click", () => {
  modal.close();
});

async function clickBox(e) {
  await getLikedList();
  let clickedBox = e.target.parentElement;

  let clicked = {
    eventId: clickedBox.id,
    eventTitle: clickedBox.children[4].children[0],
    eventImg: clickedBox.children[1].children[0],
    eventInfo: clickedBox.children[3].children[0],
    startDate:
      clickedBox.children[2].children[0].innerText +
      clickedBox.children[2].children[1].innerText +
      "日",
    endDate:
      clickedBox.children[2].children[2].innerText +
      clickedBox.children[2].children[3].innerText +
      "日",
    eventLocation: clickedBox.children[4].children[2],
    time: clickedBox.children[4].children[4],
  };
  let {
    eventId,
    eventTitle,
    eventImg,
    eventInfo,
    startDate,
    endDate,
    eventLocation,
    time,
  } = clicked;

  modalBandName.innerHTML = eventTitle.innerHTML;
  modalImg.src = eventImg.src;

  modalperformerInfo.innerHTML = eventInfo.innerHTML;
  modalperformerInfo.classList.remove("hide");
  modalShowInfo.innerHTML = `<p class="date start">${startDate}</p><p class="date end" >- ${endDate}</p><p class="time">${time.innerHTML} </p><p class="location"><i class="fa-solid fa-location-dot"></i> ${eventLocation.innerHTML}</p><input type="checkbox" id="liked-event" > <label class="saved"><span>喜歡活動</span><i class="fa-solid fa-feather"></i></label>
`;
  const likedInfo = document.getElementById("liked-event");
  likedInfo.setAttribute("value", `${eventId}`);
  const likedIcon = document.querySelector(".saved > span");

  //檢視是否為liked event
  const EventArrIndex = likedList.findIndex(
    (item) => item.eventID === likedInfo.value
  );

  if (EventArrIndex !== -1) {
    likedInfo.setAttribute("checked", "");
    likedIcon.innerText = "取消喜歡";
  }

  if (startDate === endDate) {
    modalShowInfo.children[1].classList.add("hide");
  }

  likedInfo.addEventListener("click", addLiked);

  modal.show();
}

function editEventForm(e) {
  let eventBtn = this;
  const eventArrIndex = allEvent.findIndex(
    (eventObj) => eventObj.id === eventBtn.id
  );
  currentTask = allEvent[eventArrIndex];
}

function showEventForm(e) {
  const eventBtn = this;
  const EventArrIndex = allEvent.findIndex(
    (eventObj) => eventObj.id === eventBtn.id
  );

  eventObj = allEvent[EventArrIndex];

  eventForm.reset();
  const {
    type,
    title,
    performer,
    id,
    img,
    location,
    startTime,
    endTime,
    description,
    duration,
  } = eventObj;

  const editTitle = document.querySelector(".top > p");
  closeBtn[1].innerText = "取消編輯";
  submitBtn.innerText = "編輯完成";
  editTitle.innerText = "編輯活動內容";
  const formInput = eventForm.children;

  const selectedOpts = formInput[1].children[0].children;
  //顯示活動類別
  for (let i in selectedOpts) {
    if (selectedOpts[i].dataset.name === type) {
      selectedOpts[i].selected = true;
      break;
    }
  }

  formInput[1].children[1].value = title;
  formInput[2].children[0].value = performer;

  startDate._flatpickr.input.value =
    `${startTime.date}`.slice(0, 4) +
    "/" +
    `${startTime.date}`.slice(4, 6) +
    "/" +
    `${startTime.date}`.slice(6) +
    ` ${startTime.time}`;

  endDate._flatpickr.input.value =
    `${endTime.date}`.slice(0, 4) +
    "/" +
    `${endTime.date}`.slice(4, 6) +
    "/" +
    `${endTime.date}`.slice(6) +
    ` ${endTime.time}`;

  formInput[5].children[0].value = location;
  formInput[6].children[0].value = description;
  formInput[7].children[1].setAttribute("src", `${img}`);
  formInput[8].children[0].setAttribute("src", `${img}`);

  modal2.show();
}

async function deleteEvent(e) {
  let trashBtn = this;
  const eventId = trashBtn.parentElement.id;

  try {
    const response = await fetch(`http://localhost:3000/delete/${eventId}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("活動刪除失敗");
    trashBtn.parentElement.remove(); //重表單移除
    updateEventBox();
  } catch (error) {
    console.error("Error deleting event:", error);
  }
  // allEvent.splice(EventArrIndex, 1);
  //   localStorage.setItem("myEvent", JSON.stringify(allEvent));
}

// 活動依照開始日排序
function merge(a, b) {
  let result = [];
  let i = 0;
  let j = 0;

  while (i < a.length && j < b.length) {
    if (a[i].startTime.fullTime < b[j].startTime.fullTime) {
      // console.log(a[i], a);

      result.push(a[i]);
      i++;
    } else {
      // console.log(b[j], b);

      result.push(b[j]);
      j++;
    }
  }

  while (i < a.length) {
    result.push(a[i]);
    i++;
  }
  while (j < b.length) {
    result.push(b[j]);
    j++;
  }
  return result;
}

//將arr 分成兩堆，各自比較
function mergeSort(arr) {
  if (arr.length === 0) {
    return;
  }

  if (arr.length === 1) {
    return arr;
  } else {
    let middle = Math.floor(arr.length / 2);
    let left = arr.slice(0, middle);
    let right = arr.slice(middle, arr.length);
    return merge(mergeSort(left), mergeSort(right));
  }
}

//加入我的活動
async function addLiked() {
  await getLikedList();
  let likedBtn = this;
  console.log(this);

  let likedBtnText = likedBtn.nextElementSibling.children[0];

  const likedIndex = likedList.findIndex(
    (item) => item.eventID === likedBtn.value
  );
  console.log(likedIndex);

  const likedEventID = likedBtn.value;
  likedEvent(likedBtn, likedIndex, likedEventID, likedBtnText);
}

//儲存活動
async function likedEvent(likedBtn, likedIndex, likedEventID, likedBtnText) {
  if (likedIndex === -1) {
    const response = await fetch("http://localhost:3000/liked-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ eventID: likedEventID }),
    });
    const result = await response.json();
    alert(result.message);

    likedBtn.setAttribute("checked", "");
    likedBtnText.innerText = "取消喜歡";
  } else if (likedIndex !== -1) {
    const deleteResponse = await fetch(
      `http://localhost:3000/delete/liked-events/${likedEventID}`,
      {
        method: "DELETE",
      }
    );

    const deleteResult = await deleteResponse.json();
    alert(deleteResult.message);

    likedBtn.removeAttribute("checked");
    likedBtnText.innerText = "喜歡活動";
  }

  // // localStorage.setItem("myList", JSON.stringify(likedList)); //連同event-info儲存
  await getLikedList();

  if (likedList.length > 0) {
    likedList = mergeSortNum(likedList);
  }
  console.log(likedList);

  // localStorage.setItem("myList", JSON.stringify(likedList)); //只儲存event-id
  // } else {
  //   localStorage.removeItem("myList");
  // }
}
//liked event 排序
function mergeNum(a, b) {
  let result = [];
  let i = 0;
  let j = 0;

  while (i < a.length && j < b.length) {
    if (a[i] < b[j]) {
      // console.log(a[i], a);

      result.push(a[i]);
      i++;
    } else {
      // console.log(b[j], b);

      result.push(b[j]);
      j++;
    }
  }

  while (i < a.length) {
    result.push(a[i]);
    i++;
  }
  while (j < b.length) {
    result.push(b[j]);
    j++;
  }
  return result;
}
function mergeSortNum(arr) {
  if (arr.length === 0) {
    return;
  }

  if (arr.length === 1) {
    return arr;
  } else {
    let middle = Math.floor(arr.length / 2);
    let left = arr.slice(0, middle);
    let right = arr.slice(middle, arr.length);
    return mergeNum(mergeSortNum(left), mergeSortNum(right));
  }
}
