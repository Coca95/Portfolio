import Flickity from "flickity";

var elem = document.querySelector('.main-carousel');
if (elem) {
    var flkty = new Flickity(elem, {
        // options
        cellAlign: 'left',
        contain: true,
        wrapAround: true,
        autoPlay: 2500
    });
}

