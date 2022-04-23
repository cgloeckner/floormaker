var ghost_x     = 0;
var ghost_y     = 0;
var ghost_start = null;

/// Draw the given point to the context
function drawPoint(p, ctx) {
    ctx.strokeStyle = p.color
    ctx.fillStyle   = p.color
    ctx.lineWidth   = 1
    let size        = 5
    if (p == selected) {
        ctx.strokeStyle = 'DarkOrange'
        ctx.fillStyle   = 'DarkOrange'
        size            = 10
    }
    
    ctx.beginPath()
    ctx.arc(p.x, p.y, size, 0, 2*Math.PI)
    ctx.fill()
    ctx.stroke()
}

/// Draw the given polygon to the context
function drawPolygon(p, ctx) {
    if (p.points.length == 0) {
        return;
    }

    // draw closed polygon chain
    ctx.strokeStyle = p.color
    ctx.lineWidth   = 10
    ctx.fillStyle   = background_color
    
    ctx.beginPath()
    ctx.moveTo(p.points[0].x, p.points[0].y)
    for (let i = 1; i < p.points.length; ++i) {
        ctx.lineTo(p.points[i].x, p.points[i].y)
    }
    ctx.lineTo(p.points[0].x, p.points[0].y)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // draw label
    if (p.label != '' && $('#labels')[0].checked) {
        ctx.font      = $('#size')[0].value + ' ' + fonts[$('#font')[0].value]
        ctx.textAlign = 'center'
        ctx.fillStyle = p.color
        ctx.fillText(p.label, p.center.x, p.center.y)
    }
}

/// Clear canvas and draw everything from scratch
function render() {
    // clear canvas
    ctx = $('#draw')[0].getContext('2d')
    ctx.fillStyle = background_color
    ctx.clearRect(0, 0, 800, 450)

    drawAll(ctx)
}

/// Draw all points and polygons onto the given context
function drawAll(ctx) {
    // draw polygons
    for (i in polygons) {
        drawPolygon(polygons[i], ctx)
    }
    
    // draw points
    for (i in points) {
        drawPoint(points[i], ctx)
    }

    if (room_mode) {
        // draw ghost objects
        drawPoint(ghost_point, ctx)
        ghost_polygon.points.push(ghost_point)
        drawPolygon(ghost_polygon, ctx)
        ghost_polygon.points.pop()
    
    } else if (selected != null) {
        // draw selected objects
        if (selected instanceof Point) {
            drawPoint(selected, ctx)
        }
    }

    if (room_mode) {
        /// NOTE: This is just for debugging the intersection detection
        
        /*
        let center = new Point(400, 225)

        console.log('\n---- new -------\n')
        for (i in polygons) {
            let poly = polygons[i]
            let n    = poly.points.length - 1
            console.log('VERTEX \t r \t s \t x \t y')
            for (let j = 0; j < n; ++j) {
                poly.points[j].color = 'black'
                poly.points[j+1].color = 'black'
                let ret = calcIntersection(center, mouse, poly.points[j], poly.points[j+1])
                console.log(ret.r, ret.s)
                if (ret.r > 0.0 && ret.r < 1.0 && ret.s > 0.0 && ret.s < 1.0) {
                    poly.points[j].color = 'red'
                    poly.points[j+1].color = 'red'
                    drawPoint(points[j], ctx)
                    drawPoint(points[j+1], ctx)
                }
            }
            let ret = calcIntersection(center, mouse, poly.points[n], poly.points[0])
            console.log(ret.r, ret.s)
            if (ret.r > 0.0 && ret.r < 1.0 && ret.s > 0.0 && ret.s < 1.0) {
                poly.points[n].color = 'red'
                poly.points[0].color = 'red'
                drawPoint(points[n], ctx)
                drawPoint(points[0], ctx)
            }
        }
        
        console.log('\n\n')
        
        ctx.strokeStyle = 'yellow'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(center.x, center.y)
        ctx.lineTo(mouse.x, mouse.y)
        ctx.stroke()
        */
    }
}

