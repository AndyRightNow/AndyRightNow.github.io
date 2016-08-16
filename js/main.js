require(['jquery', 'RandomBackgroundGenerator', 'canvasResizer', 'scroll_link'],
function($, RandomBackgroundGenerator, canvasResizer, youarenotgonnausethis){
    var CANVAS_ID = 'canvas';
    var canvas = document.getElementById(CANVAS_ID);

    //  Resize the canvas automatically by 100% viewport width and height
    canvasResizer.addResizer(CANVAS_ID, 1, 1);

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
});
