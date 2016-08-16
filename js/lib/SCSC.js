/*
 * Static container scrollable content
 *
 * There are 2 CSS classes you must add:
 * scsc-container, and scsc-content.
 *
 * 1. The first one is added to the container that's supposed to be
 * static.
 * 3. The second one is added to the content inside the sticky container,
 * which you want to make scrollable. This class should be in the child of the
 * 'scsc-container'.
 *
 */

define(['jquery'], function($){
    return (function(){
        var SCSC_CONTAINER = 'scsc-container',
            SCSC_CONTENT = 'scsc-content',
            SCROLL_OFFSET = 30;

        var container = $('.' + SCSC_CONTAINER),
            content = $('.' + SCSC_CONTENT);

        var contentTranslations = [];
        var rangeLow = [];

        function transform(jqueryObject, value) {
            jqueryObject.css('transform', value)
                .css('-webkit-transform', value)
                .css('-moz-transform', value)
                .css('-o-transform', value)
                .css('-ms-transform', value);
        }

        function translateY(amount) {
            return 'translateY(' + amount + 'px)';
        }

        function clamp(val, low, high) {
            return val > high ? high : val < low ? low : val;
        }

        $('html').on('mousewheel', function(event){
            var windowTop = $(window).scrollTop(),
                windowBotoom = windowTop + window.innerHeight;

            var isWheelDown = event.originalEvent.deltaY > 0 ? true : false;

            container.each(function(index, ele){
                var thisContainer = $(ele);

                var containerTop = thisContainer.offset().top,
                    containerBottom = containerTop + thisContainer.outerHeight();

                var thisContent = thisContainer.find('.' + SCSC_CONTENT);

                var contentBottom = thisContent.offset().top + thisContent.height();

                if (typeof rangeLow[index] === 'undefined') {
                    rangeLow[index] = contentBottom - (containerBottom - thisContainer.height() / 7);
                    rangeLow[index] = rangeLow[index] < 0 ? 0 : -rangeLow[index];
                }

                if (containerTop >= windowTop && containerBottom <= windowBotoom) {
                    var thisOffset = isWheelDown ? -SCROLL_OFFSET : SCROLL_OFFSET;

                    contentTranslations[index] =
                        contentTranslations[index] ?
                            contentTranslations[index] + thisOffset : thisOffset;

                    contentTranslations[index] = clamp(contentTranslations[index], rangeLow[index], 0);

                    transform(thisContent, translateY(contentTranslations[index]));
                }
            });
        });
    })();
});
