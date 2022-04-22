let grid_size   = 24;
var draw_mode   = false;
var room_mode   = false;
var button_down = null;

var selected    = null;
var mouse       = null;

var room_nodes = [];

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

function selectObject(obj) {
    if (selected != null) {
        selected.color = 'black';
    }
    selected = obj;
    if (selected != null) {
        selected.color = 'DarkOrange';
    }
}

// --------------------------------------------------------------------

function onMouseDown(event) {
    button_down = event.originalEvent.button;
}

function onMouseUp(event) {
    button_down = null;
    
    let btn = event.originalEvent.button;
    if (btn == 0) {
        onLeftClick(event);
    } else if (btn == 1) {
        onWheelClick(event);
    } else if (btn == 2) {
        onRightClick(event);
    }
}

function onLeftClick(event) {
    if (draw_mode) {
        addLine(event); 
    }

    if (room_mode) {   
        let pos = getGridPos(event);
        let obj = getPointAt(pos.x, pos.y);
        if (obj != null) {
            if (!room_nodes.includes(obj)) {
                room_nodes.push(obj);
            }
        }
    }
}

function onRightClick(event) {
    if (ghost_start == null) {
        // disable draw mode
        onToggleMode();

        if (room_mode) {
            disableRoomMode();
        }
    }

    stopLine();
}

function onWheelClick(event) {
    let pos = getMousePos(event);
    let obj = getLabelAt(pos.x, pos.y);
    
    if (obj != null) {
        let text = prompt('EDIT LABEL');
        if (text != null) {
            obj.text = text;
        }
        
    } else {
        let text = prompt('ADD LABEL');
        if (text != null) {
            let hull = discoverRoom(pos.x, pos.y);
            new Label(text, hull);
        }
    }
    redraw();
}

function onMouseMove(event) {
    mouse = getMousePos(event);
    
    if (draw_mode) {
        // update preview point to mouse (snapped to grid)
        let pos = getGridPos(event);
        ghost_x = pos.x;
        ghost_y = pos.y;

    } else {
        if (button_down == 0 && selected != null) {
            if (selected instanceof Point) {
                let pos = getGridPos(event);
                
                // check for existing point
                let other = getPointAt(pos.x, pos.y);
                if (other != null && other != selected) {
                    mergePoints(other, selected);
                    
                } else {
                    // move object
                    selected.x = pos.x;
                    selected.y = pos.y;
                    handleSplits(selected);
                }
            } else if (selected instanceof Label) {  
                let pos = getMousePos(event);
                // move label
                selected.x = pos.x;
                selected.y = pos.y;
            }
        }
    }

    if (button_down == null) {
        // select label or object
        let pos = getMousePos(event);
        let obj = getLabelAt(pos.x, pos.y);

        if (obj == null) {
            pos = getGridPos(event);
            obj = getPointAt(pos.x, pos.y);
        }
        selectObject(obj);

        if (selected != null) {
            $('#draw').css('cursor', 'move');
        } else {
            $('#draw').css('cursor', 'crosshair')
        }

        for (i in points) { points[i].color = 'black'}
        tmp = discoverRoom(mouse.x, mouse.y)
        for (i in tmp) {
            //tmp[i].color = 'red'
        }
        redraw()
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
        if (selected != null) {
            if (selected instanceof Point) {
                // delete selected point
                removePoint(selected);
                
            } else if (selected instanceof Label) {
                removeLabel(selected);
            }
            
            selected = null;
        }
        redraw();
    }
}

// --------------------------------------------------------------------

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
    
    disableDrawMode();
    disableRoomMode();
    
    saveToFile(fname);
}

function onExportMap() {
    console.log('NIY');
}

// --------------------------------------------------------------------

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
        ret = getLineBetween(ghost_start, obj);
        if (ret == null) {
            ret = new Line(ghost_start, obj);
        }

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

// --------------------------------------------------------------------

function enableDrawMode() {
    draw_mode = true;
    $('#mode').addClass('toggled');
}

function disableDrawMode() {
    draw_mode = false;
    $('#mode').removeClass('toggled');
    stopLine();
}

function onToggleMode() {
    // disable if enabled
    if (draw_mode) {
        disableDrawMode();
        
    } else {     
        disableRoomMode();
        enableDrawMode();
    }
}
    
function enableRoomMode() {
    room_mode = true;
    room_nodes = [];
    $('#room').addClass('toggled');
}

function disableRoomMode() {
    room_mode = false;
    $('#room').removeClass('toggled');

    if (room_nodes.length > 2) {
        let text = prompt('ADD LABEL');
        if (text != null) {
            let l = new Label(text, room_nodes); 
            room_nodes = [];
        }
    }
}

function onLabelRoom() { 
    // disable if enabled
    if (room_mode) { 
        disableRoomMode();
        
    } else {           
        disableDrawMode();
        enableRoomMode();
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
    $('#room').on('click', onLabelRoom);

    redraw();
}
