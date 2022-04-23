const sizes = [6, 7, 8, 9, 10, 10.5, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 26, 28, 32, 36, 40]
const default_size = 16
const fonts = ['sans-serif', 'serif', 'monospace', 'cursive']
const default_font = 'serif'

let background_color = 'white'
let foreground_color = 'black'

/// Selected point or label
let selected    = null

/// Last mouse position
let mouse       = null

/// Mouse button that is currently held down (0: left, 1: middle, 2: right)
let button_down = null

/// Indicates whether draw mode is active or not
let room_mode   = false

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
    if (room_mode) {
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
}

/// Handle a right mouse click
function onRightClick(event) {
    if (room_mode) {
        if (ghost_polygon.points.length > 0) {
            // undo last polygon point
            ghost_polygon.points.pop()

            render()

        } else {
            // leave drag mode
            onToggleRoomMode()
        }
    }
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
    
    if (!room_mode) {
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

function onLoadMap(event) {
    loadFromFile()
}

function onSaveMap(event) {
    let label = prompt('FILENAME (*.JSON)', )
    if (label != null) {
        if (!label.endsWith('.json')) {
            label += '.json'
        }
        
        disableDrawMode()
        saveToFile(label)
    }
}

function onExportMap(event) {
    let label = prompt('FILENAME (*.PNG)', )
    if (label != null) { 
        if (!label.endsWith('.png')) {
            label += '.png'
        }
        
        exportToPNG(label)
    }
}

// --------------------------------------------------------------------

function enableRoomMode() {
    room_mode = true
    $('#room').addClass('toggled')
}

function disableRoomMode() {
    room_mode = false
    $('#room').removeClass('toggled')
}

function onToggleRoomMode(event) {
    // disable if enabled
    if (room_mode) {
        disableRoomMode()
        
    } else {     
        enableRoomMode()
    }
}

function onToggleLabels(event) {
    render()
}

function onChangeSize(event) {    
    render()
}

function onChangeFont(event) {
    render()
}

function init() {
    let canvas = $('#draw');
    canvas.on('mousedown', onMouseDown)
    canvas.on('mouseup', onMouseUp)
    canvas.on('mousemove', onMouseMove) 
    //canvas.on('touchstart', onMouseDown)
    //canvas.on('touchend', onMouseUp)
    //canvas.on('touchmove', onMouseMove)

    $(document).on('keydown', onKeyDown)

    $('#load').on('change', onLoadMap)
    $('#save').on('click', onSaveMap)
    $('#export').on('click', onExportMap)
    $('#room').on('click', onToggleRoomMode)
    $('#labels').on('click', onToggleLabels)

    // create ghost objects
    ghost_point         = new Point(0, 0)
    ghost_point.color   = 'red'
    ghost_polygon       = new Polygon('', [])
    ghost_polygon.color = 'red'

    // create font sizes
    let size = $('#size')
    for (i in sizes) {
        let option = document.createElement('option')
        option.value = sizes[i] + 'pt'
        option.innerHTML = sizes[i]
        if (sizes[i] == default_size) {
            option.selected = true
        }
        size[0].append(option)
    }
    size.on('change', onChangeSize)

    // create font families
    let font = $('#font')
    for (i in fonts) {
        let option = document.createElement('option')
        option.value = i
        option.innerHTML = fonts[i] 
        if (fonts[i] == default_font) {
            option.selected = true
        }
        font[0].append(option)
    }
    font.on('change', onChangeFont)
    
    render()
}
