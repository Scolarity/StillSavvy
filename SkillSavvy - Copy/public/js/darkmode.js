const body = document.body;
const bgcCheck = localStorage.getItem("bgcCheck");
const darkModeBtn = document.getElementById("darkmode-btn");

function bgcToggle() {
  body.classList.toggle("dark-mode");
  if (body.classList.contains("dark-mode") == true) {
      localStorage.setItem("bgcCheck", "dark");
      darkLight.innerHTML = "Toggle White Mode";
  } else if (body.classList.contains("dark-mode") == false) {
      localStorage.setItem("bgcCheck", "white");
      darkLight.innerHTML = "Toggle Dark Mode";
  }
}

  


// The dark/light mode switcher code
$(document).ready(function() {
    if (bgcCheck == null) {
        body.classList.toggle("dark-mode");
        localStorage.setItem("bgcCheck", "white");
        darkLight.innerHTML = "Toggle Dark Mode";
    } else if (bgcCheck == "dark") {
        body.classList.toggle("dark-mode");
        localStorage.setItem("bgcCheck", "dark");
        darkLight.innerHTML = "Toggle White Mode";
    } else if (bgcCheck == "light") {
        body.classList.remove("dark-mode");
        localStorage.setItem("bgcCheck", "light");
        darkLight.innerHTML = "Toggle Dark Mode";
    }
});