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
