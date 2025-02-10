const bottomSection = document.querySelector(".bottom");
const likedInfoSection = document.querySelector(".liked-info");
const likedEventBtn = document.querySelector(".liked-event");
const likedcompanyBtn = document.querySelector(".liked-company");
const closeBtn = document.querySelector(".close-button");
const modalImg = document.querySelector("#img1");
const modalBandName = document.querySelector("#band-name");
const modalperformerInfo = document.querySelector("#performer-info");
const modalShowInfo = document.querySelector("#show-time");

let likedList = JSON.parse(localStorage.getItem("myList")) || [];
const allEvent = JSON.parse(localStorage.getItem("myEvent")) || [];
let likedIndexArr = [];

//liked-event 對應到的info
//找出對應的index, allEvent[i]帶入updateEventBox Fn
likedList.forEach((item) => {
  let dataIndex = allEvent.findIndex((event) => event.id === item);
  likedIndexArr.push(dataIndex);
});
showEventBox();

function showEventBox() {
  likedInfoSection.innerHTML = "";

  // 新增的event 出現在網頁上
  for (let i of likedIndexArr) {
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
    } = allEvent[i];
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
    likedInfoSection.append(divEventBox);
  }
  likedEventBtn.innerText += ` (${likedIndexArr.length})`;
}

// 每個 eventBox 點開，都會觸發modal

likedInfoSection.addEventListener("click", (e) => {
  if (e.target.parentElement.classList.value === "event-box") {
    clickBox(e);
  }
});

function clickBox(e) {
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
  modalShowInfo.innerHTML = `<p class="date start">${startDate}</p><p class="date end" >- ${endDate}</p><p class="time">${time.innerHTML} </p><p class="location"><i class="fa-solid fa-location-dot"></i> ${eventLocation.innerHTML}</p><input type="checkbox" id="liked-event" ><label class="saved">加入行事曆<i class="fa-solid fa-feather"></i></label>`;
  const likedInfo = document.getElementById("liked-event");
  likedInfo.setAttribute("value", `${eventId}`);

  //檢視是否為liked event
  const EventArrIndex = likedList.findIndex((item) => item === likedInfo.value);

  if (EventArrIndex !== -1) {
    likedInfo.setAttribute("checked", "");
  }

  if (startDate === endDate) {
    modalShowInfo.children[1].classList.add("hide");
  }

  modal.show();
}

closeBtn.addEventListener("click", () => {
  modal.close();
});

likedInfoSection.addEventListener("click", (e) => {
  const likedInfo = document.getElementById("liked-event");
  const likedIndex = likedList.indexOf(likedInfo.value);

  if (e.target.id === "liked-event") {
    likedEvent(likedInfo, likedIndex);
  }
  showEventBox();
});

//加入我的行事曆
function likedEvent(likedInfo, likedIndex) {
  // const dataindex = allEvent.findIndex((event) => event.id === likedInfo.value);

  if (likedInfo.checked === true && likedIndex === -1) {
    likedInfo.setAttribute("checked", "");
    likedList.push(likedInfo.value);
    // likedList.push(allEvent[dataindex]);
  } else {
    likedInfo.removeAttribute("checked", "");
    likedList.splice(likedIndex, 1);
  }
  likedList = mergeSortNum(likedList);
  // localStorage.setItem("myList", JSON.stringify(likedList)); //連同event-info儲存
  localStorage.setItem("myList", JSON.stringify(likedList)); //只儲存event-id
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
