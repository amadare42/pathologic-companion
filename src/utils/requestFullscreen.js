export function requestFullscreen() {
    if (document.body.webkitRequestFullScreen) {
        window.addEventListener('click', function(e) {
            if (e.target.type != 'text' && e.target.type != 'password') {
                document.body.webkitRequestFullScreen();
                // window.setTimeout(function() {
                //     document.webkitCancelFullScreen();
                // }, 500);
            }
        }, false);
    }
}
