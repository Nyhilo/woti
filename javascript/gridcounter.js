/***********
 * Helpers *
 ***********/

function clearSelection() {
    if(document.selection && document.selection.empty) {
        document.selection.empty();
    } else if(window.getSelection) {
        var sel = window.getSelection();
        sel.removeAllRanges();
    }
}


/***********
 * Objects *
 ***********/

var $counterBox = $('.count-box');

// jQuery objects
var jq = {
    counters: '.counter-button',

    // Return a new counter-button element
    cbutton: function(x, y, value) {

        var $p = $('<p />')
                .addClass('count')
                .attr('data-x', x)
                .attr('data-y', y)
                .attr('data-value', value);

        var $div = $('<div />')
                .addClass('counter-button')
                .append($p);

        return $div;
    },

    // Bind even handlers to buttons
    setEventHandlers: function($counters) {
        $counters.each(function() {
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
    },

    // Set up the initial display of the buttons from their deta values
    populateButtons: function() {
        var $counters = $('.counter-button');
        $counters.each(function() {
                var $this = $(this);
                var $count = $this.find('.count');
                var value = parseInt( $count.data("value") );
                $count.html(value);
        });
    },
};

var Grid = {
    columns: ['name1', 'name2', 'name3', 'name4'],
    rows: ['stat1', 'stat1', 'stat3', 'stat4', 'stat5'],
    size: {
        x: function() {return Grid.columns.length;},
        y: function() {return Grid.rows.length;},
    },

    populateGrid: function() {
        // Build row and buttons divs for attach to the primary content box
        for (var row = 0; row < Grid.size.y(); row++) {
            var $countRow = $('<div />')
                                .addClass('row')
                                .addClass('count-row');

            for (var col = 0; col < Grid.size.x(); col++) {
                $countRow.append(jq.cbutton(row, col, 0));
            }

            $counterBox.append($countRow);
        }

        // Now that the elements are in place,
        //  initiate their content and event handlers
        jq.setEventHandlers($(jq.counters));
        jq.populateButtons();
    },

    init: function() {
        Grid.populateGrid();
    },
};

Grid.init();