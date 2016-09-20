require(['jquery', 'RandomBackgroundGenerator', 'canvasResizer', 'scroll_link', 'Game'
], function($, RandomBackgroundGenerator, canvasResizer, __, Game) {
    var CANVAS_ID = 'canvas';
    var GAME_CANVAS_ID = 'game-canvas';
    var canvas = document.getElementById(CANVAS_ID);
    var modeName = 'Polygonal';

    //  Resize the canvas automatically by 100% viewport width and height
    canvasResizer.addResizer(CANVAS_ID, 1, 1);
    canvasResizer.addResizer(GAME_CANVAS_ID, 0.6, 0.6);

    //----------------------------------
    //  Click to generate random background
    //----------------------------------
    var Modes = {
        'Polygonal': {
            density: {
                x: 0.7, y: 0.6
            }
        },
        'OverlappedRectangles': {
            density: {
                x: 0.8, y: 0.8
            }
        }
    };
    var background = new RandomBackgroundGenerator({
        canvasId: CANVAS_ID,
        mode: modeName,
        baseColors: ['#4183d7', '#26A65B', '#663399'],
        density: Modes[modeName].density,
        rectWidth: 1055,
        rectHeight: 1005,
        isMixed: false
    });
    background.generate();
    document.addEventListener('click', function(event) {
        if (event.target.tagName === 'SECTION') {
            background.generate();
        }
    });

    //  Add callback for the background - generate background when resizing
    canvasResizer.addResizerCallback(CANVAS_ID, function() {
        background.generate();
    });

    //--------------------------------
    //  Toggle side nav
    //--------------------------------
    $('.side-nav-btn, .side-nav .menu-item').click(function(event) {
        $('.side-nav').toggleClass('side-nav-out');
        $('.side-nav-btn').toggleClass('side-nav-btn-out');
    });

    $('.play-game').click(function(event) {
        if ($("#" + GAME_CANVAS_ID).hasClass('none')) {
            $("#" + GAME_CANVAS_ID).removeClass('none');
            Game.init(GAME_CANVAS_ID);
        }
    });
});
