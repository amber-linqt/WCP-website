const memberSwitch = document.querySelectorAll(".right > div:not(.switch-btn)");
const switchBtn = document.querySelectorAll(".switch");

console.log(memberSwitch);

const switchForm = (e) => {
  let clicked = document.querySelector(".active");
  clicked.classList.remove("active");

  memberSwitch.forEach((memberSwitch) => {
    memberSwitch.classList.add("hide");

    // login
    if (e.target.classList[1] === memberSwitch.id) {
      memberSwitch.classList.remove("hide");
    }
    e.target.classList.add("active");
    console.log(e.target.classList, memberSwitch.id);
  });
};
switchBtn.forEach((button) => button.addEventListener("click", switchForm));
