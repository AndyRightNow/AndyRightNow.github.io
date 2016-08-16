/*
 * Resize the canvas to the size of the viewport
 */

define(function(){
    return (function(){
        var canvasResizer = {
            _canvasList: [],
            addResizer: function(canvasId) {
                var canvas = document.getElementById(canvasId);

                if (canvas) {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;

                    this._canvasList.push(canvas);
                }
            }
        };

        window.addEventListener('resize', function(e){
            canvasResizer._canvasList.forEach(function(ele){
                ele.width = window.innerWidth;
                ele.height = window.innerHeight;
            });
        });

        return canvasResizer;
    })();
});
