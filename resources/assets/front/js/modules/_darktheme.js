const icon = document.getElementById("icon");
icon.onclick = function () {
    document.body.classList.toggle("dark-theme");
    if (document.body.classList.contains("dark-theme")) {
        icon.src = "../public/assets/front/img/black-sun-png-sun-icons-512.png"
    } else {
        icon.src = "../public/assets/front/img/moon.png"
    }
}