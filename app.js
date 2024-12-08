const mainSection = document.querySelector("#event");
const eventBox = document.querySelectorAll(".event-box");
const bandImg = document.querySelectorAll(".bandImg");
const bandName = document.querySelectorAll(".band");
const showTime = document.querySelectorAll(".time");
const month = document.querySelectorAll(".month");
const day = document.querySelectorAll(".day");
const place = document.querySelectorAll(".location");
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
//日期
const dateSelector = document.querySelectorAll(".dateSelector");
// event filter，選取filter 和 event-box
const filterSelect = document.querySelectorAll(".custom-select");

const modal = document.querySelector("#modal");
const closeBtn = document.querySelectorAll(".close-button");
const modalImg = document.querySelector("#img1");
const modalBandName = document.querySelector("#band-name");
const modalShowTime = document.querySelector("#show-time");

const addBtn = document.querySelector("#add-event");
const modal2 = document.querySelector("#edit-event-box");

const allEvent = JSON.parse(localStorage.getItem("myEvent")) || [];

// 設定活動篩選器 fn
const filterBox = (e) => {
  let selected = document.querySelector(".active");

  selected.classList.remove("active");
  e.target.selectedOptions[0].classList.add("active");

  //---開始篩選---
  eventBox.forEach((eventBox) => {
    eventBox.classList.add("hide");

    if (
      eventBox.dataset.name === e.target.selectedOptions[0].dataset.name ||
      e.target.selectedOptions[0].dataset.name === "all-type"
    ) {
      eventBox.classList.remove("hide");
    }
  });
};

filterSelect.forEach((select) => select.addEventListener("change", filterBox));

//活動編輯器
addBtn.addEventListener("click", () => {
  modal2.show();
});
closeBtn[0].addEventListener("click", () => {
  modal2.close();
});

// flatpick function
const currentTime = new Date();

config = {
  enableTime: true, //可選時與分
  dateFormat: "Y/m/d H:i", //時間格式
  time_24hr: true, //24 時制
  minuteIncrement: 15, //分鐘每次選擇間隔單位
  allowInput: true, //可輸入控制
  minDate: "today", //可選最小時間，可直接接受 'today' 字串
  maxDate: currentTime.setMonth(currentTime.getMonth() + 6), //可選最大時間，從今天起一個月,
  onClose: function (selectedDates, dateStr, instance) {
    checkDateTime(dateStr, instance.input.id);
  },
};
flatpickr(dateSelector, config);
let startDateValue = null;
let endDateValue = null;

function checkDateTime(dateStr, id) {
  if (id === "startDate") {
    startDateValue = dateStr;
  }

  if (id === "endDate") {
    endDateValue = dateStr;
  }
  if (startDateValue >= endDateValue) {
    alert("結束時間需晚於開始時間");
    startDate.value = "";
    endDate.value = "";
  }
}

imgInput.addEventListener("change", (e) => {
  const newImg = document.createElement("img");
  newImg.src = URL.createObjectURL(e.target.files[0]);
  imgInput.src = newImg.src;
});

eventForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addEvent();
});

function addEvent() {
  const eventObj = {
    type: eventType.selectedOptions[0].dataset.name,
    title: titleInput.value.trim(),
    id: startDate.value + titleInput.value.trim(),
    img: imgInput.src,
    location: locationInput.value.trim(),
    //month, day
    startTime: {
      month: startDate._flatpickr.latestSelectedDateObj.getMonth() + 1 + "月",
      day: startDate._flatpickr.latestSelectedDateObj.getDate(),
      date: startDate.value.split(" ")[0],
      time: startDate.value.split(" ")[1],
    },
    endTime: {
      month: endDate._flatpickr.latestSelectedDateObj.getMonth() + 1 + "月",
      day: endDate._flatpickr.latestSelectedDateObj.getDate(),
      date: endDate.value.split(" ")[0],
      time: endDate.value.split(" ")[1],
    },
    description: descriptionInput.value.trim(),

    //確認是否為一日活動
    duration: function () {
      return this.startTime.date == this.endTime.date;
    },
  };
  allEvent.push(eventObj);
  localStorage.setItem("myEvent", JSON.stringify(allEvent));
  eventForm.reset(); //表單送出後清空form
  createEventBox(eventObj);
  console.log(allEvent);
}

// function updateEventBox() {}

// 新增的event 出現在網頁上
function createEventBox(obj) {
  const divEventBox = document.createElement("div");
  divEventBox.className = "event-box";
  divEventBox.setAttribute("id", "event-box");
  const divEventDate = document.createElement("div");
  divEventDate.className = "event-date";
  const divEventInfo = document.createElement("div");
  divEventInfo.className = "event-info";

  allEvent.forEach((eventObj) => {
    divEventBox.setAttribute("data-name", `"${eventObj.type}"`);
    divEventBox.innerHTML = `<img class="bandImg" src="${eventObj.img}" alt="${eventObj.title}" />`;
    divEventDate.innerHTML = `<p class="month">${eventObj.startTime.month}</p>
    <p class="day">${eventObj.startTime.day}</p><p class="month end">${eventObj.endTime.month}</p>
    <p class="day end">${eventObj.endTime.day}</p>`;
    divEventInfo.innerHTML = `<p class="band">${eventObj.title}</p>
              <br />
              <p class="location">${eventObj.location}</p>
              <br />
              <p class="time">
                  <i class="fa-solid fa-clock"></i>
                ${eventObj.startTime.time}-${eventObj.endTime.time}
              </p>`;

    if (eventObj.duration() === true) {
      divEventDate.children[2].classList.add("hide");
      divEventDate.children[3].classList.add("hide");
    }

    divEventBox.append(divEventDate);
    divEventBox.append(divEventInfo);
  });

  mainSection.append(divEventBox);
}

// 每個 eventBox 點開，都會觸發modal
const clickBox = (index) => {
  eventBox[index].addEventListener("click", () => {
    modalBandName.innerHTML = bandName[index].innerHTML;
    modalImg.src = bandImg[index].src;
    modalShowTime.innerHTML =
      month[index].innerHTML +
      day[index].innerHTML +
      showTime[index].innerHTML +
      "<br>" +
      place[index].innerHTML;
    modal.show();
  });
};

for (let i = 0; i < eventBox.length; i++) {
  clickBox(i);
}

closeBtn[1].addEventListener("click", () => {
  modal.close();
});
