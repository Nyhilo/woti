(function() {
    var $counter = $('.counter-button');

    $counter.each(function() {
        var $this = $(this);
        $this.click(function() {
            clearSelection();
            var $count = $this.find('.count');
            var value = parseInt( $count.data("value") );
            console.log(value);
            $count.html(value+1);
            $count.data("value", value+1);
        });
    });

    function clearSelection() {
        if(document.selection && document.selection.empty) {
            document.selection.empty();
        } else if(window.getSelection) {
            var sel = window.getSelection();
            sel.removeAllRanges();
        }
    }

})();