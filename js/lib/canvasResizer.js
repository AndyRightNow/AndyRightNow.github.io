/*
 * Resize the canvas to the size of a certain percentage of the viewport
 */

define(function(){
    return (function(){
        var canvasResizer = {
            _canvasList: [],
            _sizes: {},
            _callbacks: {},
            /*
             * Add resize listener for the canvas with specific size
             * Every time the browser resize, the canvas will change to its specific size
             *
             * @param {String} canvasId: The id of the canvas
             * @param {Number} width, height: Non-negative number that is the percentage
             *                                of the viewport. They are 1 by default.
             */
            addResizer: function(canvasId, width, height, callback) {
                width = width || 1;
                height = height || 1;

                var canvas = document.getElementById(canvasId);

                if (canvas) {
                    this._sizes[canvasId] = { 'width': width, 'height': height};

                    canvas.width = width * window.innerWidth;
                    canvas.height = height * window.innerHeight;

                    this._canvasList.push(canvas);
                }
            },

            /*
             * Add callback for this resizer(when the resizer is done)
             *
             * @param {String} canvasId: The id of the canvas
             * @param {Function} callback: The function to execute after resizing
             */
            addResizerCallback: function(canvasId, callback) {
                this._callbacks[canvasId] = callback;
            }
        };

        window.addEventListener('resize', function(e){
            canvasResizer._canvasList.forEach(function(ele){
                //------------------------------
                //  Resize the canvas
                //------------------------------
                ele.width = window.innerWidth * canvasResizer._sizes[ele.id].width;
                ele.height = window.innerHeight * canvasResizer._sizes[ele.id].height;

                //  Call callbacks
                if (typeof canvasResizer._callbacks[ele.id] === 'function')
                    canvasResizer._callbacks[ele.id]();
            });
        });

        return canvasResizer;
    })();
});
