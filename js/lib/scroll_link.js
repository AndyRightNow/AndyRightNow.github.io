define(['jquery'], function($){
    //---------------------------------
    //  Scroll to internal link
    //---------------------------------
    return (function(){
        var ANIMATE_TIME = 600;

        $(".scroll-link").on('click', function(event) {
            var thisHref = $(this).attr('href');
            if (typeof thisHref !== "undefined") { //  Check if it's in an anchor tag or with href
                if (thisHref[0] === '#') { //  Check if it's internal link
                    event.preventDefault();

                    //  Store the internal link address
                    var thisHash = this.hash;

                    $('html, body').animate({
                        scrollTop: $(thisHash).offset().top
                    }, ANIMATE_TIME, function() {
                        //  Jump to the address
                        window.location.hash = thisHash;
                    });
                }
            }
        });
    })();
});
