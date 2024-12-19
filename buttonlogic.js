var home = document.getElementById("home");
if (home) {
  home.addEventListener("click", function (e) {
    window.location.href = "dashboard.html";
  });
}

var aboutUs = document.getElementById("aboutUs");
if (aboutUs) {
  aboutUs.addEventListener("click", function (e) {
    window.location.href = "aboutus.html";
  });
}

var helpCenter = document.getElementById("questions");
if (aboutUs) {
  helpCenter.addEventListener("click", function (e) {
    window.location.href = "HelpCenter.html";
  });
}

var helpCenter = document.getElementById("profile");
if (aboutUs) {
  helpCenter.addEventListener("click", function (e) {
    window.location.href = "profile.html";
  });
}

let isDefaultImage = true;

function changeImage() {
  const connectButton = document.getElementById("connectButton");
  connectButton.classList.add("fade-out");
  setTimeout(() => {
    if (isDefaultImage) {
      connectButton.src = "Images/connection_clicked.png";
    } else {
      connectButton.src = "Images/connection.png";
    }
    isDefaultImage = !isDefaultImage;
    connectButton.classList.remove("fade-out");
  });
}

const image = document.getElementById("whiteBorder");
const button = document.querySelectorAll(".buttons");
let isMovedDown = false;

image.addEventListener("click", () => {
  if (!isMovedDown) {
    button.forEach((buttons) => {
      buttons.style.transform = "translateY(100px)";
    });
    image.style.transform = "translateY(100px)";
  } else {
    button.forEach((buttons) => {
      buttons.style.transform = "translateY(0)";
    });
    image.style.transform = "translateY(0)";
  }
  isMovedDown = !isMovedDown;
});
