require(['jquery', 'RandomBackgroundGenerator', 'canvasResizer', 'scroll_link',
        'SCSC', 'Game'],
function($, RandomBackgroundGenerator, canvasResizer, __, __, Game){
    var CANVAS_ID = 'canvas';
    var GAME_CANVAS_ID ='game-canvas';
    var canvas = document.getElementById(CANVAS_ID);

    //  Resize the canvas automatically by 100% viewport width and height
    canvasResizer.addResizer(CANVAS_ID, 1, 1);
    canvasResizer.addResizer(GAME_CANVAS_ID, 0.6, 0.6);

    //----------------------------------
    //  Click to generate random background
    //----------------------------------
    var background = new RandomBackgroundGenerator(CANVAS_ID, 'Polygonal',
        '#4183d7', '#26A65B', '#663399');
    background.getMode().setDensity(0.8);
    background.generate();
    background.enabled = true;
    document.addEventListener('click', function(event){
        if (event.target.tagName === 'SECTION' && background.enabled) {
            background.generate();
        }
    });

    //  Add callback for the background - generate background when resizing
    canvasResizer.addResizerCallback(CANVAS_ID, function(){
        background.generate();
    });

    //--------------------------------
    //  Toggle side nav
    //--------------------------------
    $('.side-nav-btn, .side-nav .menu-item').click(function(event){
        $('.side-nav').toggleClass('side-nav-out');
        $('.side-nav-btn').toggleClass('side-nav-btn-out');
    });

    $('.play-game').click(function(event){
        if ($("#" + GAME_CANVAS_ID).hasClass('none')) {
            $("#" + GAME_CANVAS_ID).removeClass('none');
            Game.init(GAME_CANVAS_ID);
        }
    });
});
