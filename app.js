const mainSection = document.querySelector("#event");

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

const openEditBoxBtn = document.querySelector(".open-edit-box");
const editBox = document.querySelector("#edit-box");
const modal = document.querySelector("#modal");
const closeBtn = document.querySelectorAll(".close-button");
const addBtn = document.querySelector("#add-event");
const modalImg = document.querySelector("#img1");
const modalBandName = document.querySelector("#band-name");
const modalperformerInfo = document.querySelector("#performer-info");
const modalShowInfo = document.querySelector("#show-time");
const modal2 = document.querySelector("#edit-event-box");

const allEvent = JSON.parse(localStorage.getItem("myEvent")) || [];
console.log(editBox, modal2);

updateEventBox();
editEventBtn();
// 設定活動篩選器 fn
const filterBox = (e) => {
  let selected = document.querySelector(".active");

  selected.classList.remove("active");
  e.target.selectedOptions[0].classList.add("active");

  //---開始篩選---
  eventBox.forEach((eventBox) => {
    eventBox.classList.add("hide");

    if (
      eventBox.value === e.target.selectedOptions[0].value ||
      e.target.selectedOptions[0].value === "all-type"
    ) {
      eventBox.classList.remove("hide");
    }
  });
};

filterSelect.forEach((select) => select.addEventListener("change", filterBox));
console.log(closeBtn);

//活動編輯器
openEditBoxBtn.addEventListener("click", () => {
  editBox.show();
});
closeBtn[0].addEventListener("click", (e) => {
  editBox.close();
});
addBtn.addEventListener("click", (e) => {
  modal2.show();
});
closeBtn[1].addEventListener("click", (e) => {
  modal2.close();
});
console.log(modal2.children);

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
      date: startDate.value.split(" ")[0].split("/").join(""),
      time: startDate.value.split(" ")[1],
    },
    endTime: {
      month: endDate._flatpickr.latestSelectedDateObj.getMonth() + 1 + "月",
      day: endDate._flatpickr.latestSelectedDateObj.getDate(),
      date: endDate.value.split(" ")[0].split("/").join(""),
      time: endDate.value.split(" ")[1],
    },
    description: descriptionInput.value.trim(),

    //確認是否為一日活動
    duration: function () {
      return this.startTime.date === this.endTime.date;
    },
  };
  allEvent.push(eventObj);
  localStorage.setItem("myEvent", JSON.stringify(allEvent));
  editEventBtn();
  updateEventBox(); //main.append
  editEventBtn(); // 更改後的活動出現在編輯列表
  eventForm.reset(); //表單送出後清空form;
}

function updateEventBox() {
  mainSection.innerHTML = "";
  // 新增的event 出現在網頁上
  allEvent.forEach((eventObj) => {
    const divEventBox = document.createElement("div");
    divEventBox.className = "event-box";
    divEventBox.setAttribute("id", "event-box");
    const divPerformerInfo = document.createElement("div");
    divEventBox.setAttribute("id", "performer-info");
    const divEventDate = document.createElement("div");
    divEventDate.className = "event-date";
    const divEventInfo = document.createElement("div");
    divEventInfo.className = "event-info";

    divEventBox.setAttribute("value", `${eventObj.type}`); //checked

    divEventBox.innerHTML = `<div class="filter"></div><img class="event-image" src="${eventObj.img}" alt="${eventObj.title}" />`;
    divPerformerInfo.innerHTML = `<p class="description hide">${eventObj.description}</p>`;
    divEventDate.innerHTML = `<p class="month start" >${eventObj.startTime.month}</p>
<p class="day start" id="event-start">${eventObj.startTime.day}</p>
<p class="month end">${eventObj.endTime.month}</p>
    <p class="day end">${eventObj.endTime.day}</p>`;
    divEventInfo.innerHTML = `<p class="performer">${eventObj.title}</p>
              <br />
              <p class="location">${eventObj.location}</p>
              <br />
              <p class="time"><i class="fa-solid fa-clock"></i>    ${eventObj.startTime.time}-${eventObj.endTime.time}
              </p>`;

    if (eventObj.startTime.date === eventObj.endTime.date) {
      divEventDate.children[2].classList.add("hide");
      divEventDate.children[3].classList.add("hide");
    }

    divEventBox.append(divEventDate);
    divEventBox.append(divPerformerInfo);
    divEventBox.append(divEventInfo);
    mainSection.append(divEventBox);
  });
}

function editEventBtn() {
  allEvent.forEach((eventObj) => {
    let editEventDiv = document.createElement("div");
    editEventDiv.className = "edit-event-div";
    let trashBtn = document.createElement("button");
    trashBtn.className = "trashBtn";
    trashBtn.innerHTML = `<i class="fa-solid fa-trash"></i>`;
    let eventBtn = document.createElement("button");
    eventBtn.className = "eventBtn";
    eventBtn.innerHTML = ` <i class="fa-solid fa-angles-right"></i>    ${eventObj.title}`;
    editEventDiv.append(eventBtn);
    editEventDiv.append(trashBtn);
    editBox.append(editEventDiv);

    //點開每個活動按鈕，出現編輯表格
    eventBtn.addEventListener("click", () => {
      let editTitle = document.querySelector(".top > p");
      closeBtn[1].innerText = "取消編輯";
      submitBtn.innerText = "編輯完成";
      editTitle.innerText = "編輯活動內容";
      let formInput = eventForm.children;
      let selectedOpts = formInput[1].children[0].children;
      for (let i in selectedOpts) {
        if (selectedOpts[i].dataset.name === `${eventObj.type}`) {
          selectedOpts[i].selected = true;
          break;
        }
      }
      formInput[1].children[1].value = `${eventObj.title}`;

      startDate._flatpickr.input.value =
        `${eventObj.startTime.date}`.slice(0, 4) +
        "/" +
        `${eventObj.startTime.date}`.slice(4, 6) +
        "/" +
        `${eventObj.startTime.date}`.slice(6) +
        ` ${eventObj.startTime.time}`;
      endDate._flatpickr.input.value =
        `${eventObj.endTime.date}`.slice(0, 4) +
        "/" +
        `${eventObj.endTime.date}`.slice(4, 6) +
        "/" +
        `${eventObj.endTime.date}`.slice(6) +
        ` ${eventObj.endTime.time}`;
      formInput[4].children[0].value = `${eventObj.location}`;
      formInput[5].children[0].value = `${eventObj.description}`;
      modal2.show();
    });
  });
}

closeBtn[1].addEventListener("click", (e) => {
  modal2.close();
});

const eventBox = document.querySelectorAll(".event-box");
const eventImg = document.querySelectorAll(".event-image");
const eventStart = document.querySelectorAll(".start");
const eventDate = document.querySelectorAll(".event-date");
const eventEnd = document.querySelectorAll(".end");
const time = document.querySelectorAll(".time");
const eventLocation = document.querySelectorAll(".location");
const eventTitle = document.querySelectorAll(".performer");
const day = document.querySelectorAll("day");
const performerInfo = document.querySelectorAll(".description");

// 每個 eventBox 點開，都會觸發modal
function clickBox(index) {
  eventBox[index].addEventListener("click", () => {
    // eventStart[index * 2 + 1].innText;//始日
    modalBandName.innerHTML = eventTitle[index].innerHTML;
    modalImg.src = eventImg[index].src;
    modalImg.addEventListener("load", () => {
      URL.revokeObjectURL(src);
    });
    modalperformerInfo.innerHTML = performerInfo[index].innerHTML;
    modalperformerInfo.classList.remove("hide");

    modalShowInfo.innerHTML = `<p class="date start">${
      eventStart[index * 2].innerText
    }${eventStart[index * 2 + 1].innerText}日</p><p class="date end" >- ${
      eventEnd[index * 2].innerText
    }${eventEnd[index * 2 + 1].innerText}日</p><p class="time">${
      time[index].innerHTML
    } </p><p class="location">${eventLocation[index].innerHTML}</p>`;

    if (
      eventStart[index * 2].innerText === eventEnd[index * 2].innerText &&
      eventStart[index * 2 + 1].innerText === eventEnd[index * 2 + 1].innerText
    ) {
      modalShowInfo.children[1].classList.add("hide");
    }
    modal.show();
  });
}
for (let i = 0; i < eventBox.length; i++) {
  clickBox(i);
}

closeBtn[1].addEventListener("click", () => {
  modal.close();
});
