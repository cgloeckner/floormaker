/*
var room_mode   = false;

var room_nodes = [];
*/

/// Selected point or label
let selected    = null

/// Last mouse position
let mouse       = null

/// Mouse button that is currently held down (0: left, 1: middle, 2: right)
let button_down = null

/// Indicates whether draw mode is active or not
let draw_mode   = false

/// Ghost point shown in draw mode
let ghost_point   = null;

/// Ghost polygon shown in draw mode
let ghost_polygon = null;

// --------------------------------------------------------------------

function getMousePos(event) {
    let rect = event.target.getBoundingClientRect()
    return {
        'x': event.originalEvent.x - rect.left,
        'y': event.originalEvent.y - rect.top
    }
}

function getGridPos(event) {
    let pos = getMousePos(event)
    return snapToGrid(pos.x, pos.y)
}

// --------------------------------------------------------------------

/// Handle holding a mouse button down
function onMouseDown(event) {
    button_down = event.originalEvent.button
}

/// Handle releasing a mouse button
function onMouseUp(event) {
    button_down = null

    switch (event.originalEvent.button) {
        case 0:
            onLeftClick(event)
            break
        case 1:
            onMiddleClick(event)
            break
        case 2:
            onRightClick(event)
            break
    }
}

/// Handle a left mouse click
function onLeftClick(event) {
    if (draw_mode) {
        // add point to pending polygon
        let p = getOrAddPoint(ghost_point.x, ghost_point.y)
        if (advancePolygon(p, ghost_polygon)) {
            // polygon chain got closed
            let label = prompt('ADD LABEL')
            if (label != null) {
                let poly = new Polygon(label, ghost_polygon.points)
                addPolygon(poly)
                ghost_polygon.points = []
            }
        }
    
    } else {
        // check for existing point before moving it
        let gridpos = snapToGrid(mouse.x, mouse.y)
        let other   = getPointAt(gridpos.x, gridpos.y, ignore=selected)
        
        if (other != null && other != selected) {
            // merge both points
            mergePoints(other, selected)
        }

        if (selected != null) {
            // check for polygon merge
            checkPolygonMerge(selected)
        }
    }

    
    
    /*
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
    }*/
}

/// Handle a right mouse click
function onRightClick(event) {
    if (draw_mode) {
        if (ghost_polygon.points.length > 0) {
            // undo last polygon point
            ghost_polygon.points.pop()

            render()

        } else {
            // leave drag mode
            onToggleMode()
        }
    }
    
    /*
    if (ghost_start == null) {
        // disable draw mode
        onToggleMode();

        if (room_mode) {
            disableRoomMode();
        }
    }

    stopLine();
    */
}

/// Handle a middle mouse click
function onMiddleClick(event) {
    let pos = getMousePos(event)
    let obj = getPolygonAt(pos.x, pos.y)
    
    if (obj != null) {
        let label = prompt('EDIT LABEL', obj.label)
        if (label != null) {
            obj.label = label

            render()
        }
    }
}

function onMouseMove(event) {
    // save mouse position for later
    mouse = getMousePos(event)
    
    // update ghost point
    let gridpos = snapToGrid(mouse.x, mouse.y)
    ghost_point.x = gridpos.x
    ghost_point.y = gridpos.y
    
    if (!draw_mode) {
        if (button_down == null) {
            // select point by hovering
            selected = getPointAt(mouse.x, mouse.y)
        }
        
        if (selected != null && button_down == 0) {
            // drag it along
            selected.x = gridpos.x
            selected.y = gridpos.y

            // refresh all polygons
            for (i in polygons) {
                refreshPolygon(polygons[i])
            }
        }
        
        // update mouse cursor
        if (selected != null) {
            $('#draw').css('cursor', 'move');
        } else {
            $('#draw').css('cursor', 'crosshair')
        }
    }
    
    render()

    /*
    
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

        redraw()
    }
    
    redraw();
    */
}

/// Handle holding a key down
function onKeyDown(event) {
    let key = event.originalEvent.key
    
    if (key == 'Delete' || key == 'Backspace') {
        if (selected != null) {
            if (selected instanceof Point) {
                // delete selected point
                removePoint(selected);
                
            }
            
            selected = null;
        }

        render()
    }
}

// --------------------------------------------------------------------

function onLoadMap() {
    loadFromFile()
}

function onSaveMap() {
    // pick last filename if available
    let fname = $('#load').val().split('\\').pop()
    if (fname == '') {
        fname = 'untitled.json'
    }
    
    disableDrawMode()
    
    saveToFile(fname)
}

function onExportMap() {
    console.log('NIY')
}

// --------------------------------------------------------------------

/*
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
*/

// --------------------------------------------------------------------

function enableDrawMode() {
    draw_mode = true
    $('#mode').addClass('toggled')
}

function disableDrawMode() {
    draw_mode = false
    $('#mode').removeClass('toggled')
}

function onToggleMode() {
    // disable if enabled
    if (draw_mode) {
        disableDrawMode()
        
    } else {     
        enableDrawMode()
    }
}


function init() {
    let canvas = $('#draw');
    canvas.on('mousedown', onMouseDown)
    //canvas.on('touchstart', onMouseDown)
    canvas.on('mouseup', onMouseUp)
    //canvas.on('touchend', onMouseUp)
    canvas.on('mousemove', onMouseMove)
    //canvas.on('touchmove', onMouseMove)

    $(document).on('keydown', onKeyDown)

    $('#load').on('change', onLoadMap)
    $('#save').on('click', onSaveMap)
    $('#export').on('click', onExportMap)
    $('#mode').on('click', onToggleMode)

    // create ghost objects
    ghost_point         = new Point(0, 0)
    ghost_point.color   = 'red'
    ghost_polygon       = new Polygon('', [])
    ghost_polygon.color = 'red'

    render()
}
