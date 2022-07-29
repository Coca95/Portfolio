const icon = document.getElementById("icon");
icon.onclick = function () {
    document.body.classList.toggle("dark-theme");
    if (document.body.classList.contains("dark-theme")) {
        icon.src = "https://pluspng.com/img-png/black-sun-png-sun-icons-512.png"
    } else {
        icon.src = "https://www.pinclipart.com/picdir/big/82-820235_white-crescent-moon-clipart-png-download.png"
    }
}