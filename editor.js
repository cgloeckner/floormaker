let grid_size   = 24;
var draw_mode   = false;
var button_down = null;

var selected    = [];

// --------------------------------------------------------------------

function getMousePos(event) {
    let rect = event.target.getBoundingClientRect();
    return {
        'x': event.originalEvent.x - rect.left,
        'y': event.originalEvent.y - rect.top
    };
}

function getGridPos(event) {
    let pos = getMousePos(event);
    return matchToGrid(pos.x, pos.y);
}

function selectObject(obj, add=false) {
    if (!add) {
        // reset selection
        for (i in selected) {
            selected[i].color = 'black';
        }
        selected = [];
    }
    if (obj != null) {
        selected.push(obj);
        obj.color = 'DarkOrange';
    }
}

// --------------------------------------------------------------------

function onMouseDown(event) {
    button_down = event.originalEvent.button;
}

function onMouseUp(event) {
    button_down = null;
    
    let btn = event.originalEvent.button;
    if (btn == 0) { // left click
        if (draw_mode) {
            addLine(event); 
        }
    } else if (btn == 2) { // right click
        onRightClick();
    }
}

function getOrAddPoint(x, y) {
    // try to fetch point
    let obj = getPointAt(x, y);
    if (obj == null) {
        // create it
        obj = new Point(x, y);

        // handle lines being split by this point
        // FIXME
        handleSplits(obj);
    }
    
    return obj;
}

function addLine(event) {
    var ret = null;

    // fetch or fix point
    let pos = getGridPos(event);
    let obj = getOrAddPoint(pos.x, pos.y);

    if (ghost_start == null) {
        // create new ghost line
        ghost_start = obj;
        
    } else if (ghost_start != obj) {
        // create line from ghost line's start to current point
        ret = new Line(ghost_start, obj);

        // handle line intersections by adding more points inbetween
        handleIntersections(ret);
         
        // continue ghost line from last position
        ghost_start = obj;
    }
    
    redraw();
}

function stopLine() {
    if (ghost_start != null) {
        // stop ghost line
        ghost_start = null;

        redraw();
    }
}

function onRightClick() {
    if (ghost_start == null) {
        // disable draw mode
        onToggleMode();
    }

    stopLine();
}

function onMouseMove(event) {
    if (draw_mode) {
        // update preview point to mouse (snapped to grid)
        let pos = getGridPos(event);
        ghost_x = pos.x;
        ghost_y = pos.y;

    } else {
        if (button_down == 0 && selected.length > 0) {
            // move object
            let pos = getGridPos(event);
            selected[0].x = pos.x;
            selected[0].y = pos.y;   
        }
    }

    if (button_down == null) {
        // select objects
        let pos = getGridPos(event);
        let obj = getPointAt(pos.x, pos.y);
        selectObject(obj);

        if (selected.length > 0) {
            $('#draw').css('cursor', 'move');
        } else {
            $('#draw').css('cursor', 'crosshair')
        }
    }
    
    redraw();
}

function onLeftDrag(event) {
    let pos = getGridPos(event);
    let obj = getPointAt(pos.x, pos.y);
}

function onKeyDown(event) {
    let key = event.originalEvent.key
    if (key == 'Delete' || key == 'Backspace') {
        for (i in selected) {
            if (selected[i] != null) {   
                console.log('remove', selected[i]);
                removePoint(selected[i]);
            }
        }
        selected = [];
        redraw();
    }
}

function onLoadMap() {
    loadFromFile();
    redraw();
}

function onSaveMap() {
    // pick last filename if available
    let fname = $('#load').val().split('\\').pop();
    if (fname == '') {
        fname = 'untitled.json';
    }
    
    if (draw_mode) {
        disableDrawMode();
    }
    saveToFile(fname);
    if (draw_mode) {
        enableDrawMode();
    }
}

function onExportMap() {
    console.log('NIY');
}

function enableDrawMode() {
    $('#mode').addClass('toggled');
}

function disableDrawMode() {
    $('#mode').removeClass('toggled');
    stopLine();
}

function onToggleMode() {
    draw_mode = !draw_mode;
    
    if (draw_mode) {
        enableDrawMode();
        
    } else {
        disableDrawMode();
    }
}

function init() {
    let canvas = $('#draw');
    canvas.on('mousedown', onMouseDown);
    canvas.on('touchstart', onMouseDown);
    canvas.on('mouseup', onMouseUp);
    canvas.on('touchend', onMouseUp);
    canvas.on('mousemove', onMouseMove);
    canvas.on('touchmove', onMouseMove);

    $(document).on('keydown', onKeyDown);

    $('#load').on('change', onLoadMap);
    $('#save').on('click', onSaveMap);
    $('#export').on('click', onExportMap);
    $('#mode').on('click', onToggleMode);

    redraw();

    console.log('Initialized')
}
