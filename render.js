var ghost_x     = 0;
var ghost_y     = 0;
var ghost_start = null;

/// Draw the given point to the context
function drawPoint(p, ctx) {
    if (p != selected) {
        ctx.strokeStyle = p.color
        ctx.fillStyle   = p.color
        ctx.lineWidth   = 1
    } else {
        ctx.strokeStyle = 'DarkOrange'
        ctx.fillStyle   = 'DarkOrange'
        ctx.lineWidth   = 5
    }
    ctx.beginPath()
    ctx.arc(p.x, p.y, 15, 0, 2*Math.PI)
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
    ctx.lineWidth = 10
    ctx.beginPath()
    ctx.moveTo(p.points[0].x, p.points[0].y)
    for (let i = 1; i < p.points.length; ++i) {
        ctx.lineTo(p.points[i].x, p.points[i].y)
    }
    ctx.lineTo(p.points[0].x, p.points[0].y)
    ctx.stroke()

    // draw label
    if (p.label != '') {
        ctx.font      = p.fontsize + 'pt ' + p.fontfamily
        ctx.textAlign = 'center'
        ctx.fillStyle = 'black'
        ctx.fillText(p.label, p.center.x, p.center.y)
    }
}

/// Draw everything from scratch
function render(select) {
    // clear canvas
    let ctx = $('#draw')[0].getContext('2d')
    ctx.clearRect(0, 0, 800, 450)

    // draw polygons
    for (i in polygons) {
        drawPolygon(polygons[i], ctx)
    }
    
    // draw points
    for (i in points) {
        drawPoint(points[i], ctx)
    }

    if (draw_mode) {
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

    if (draw_mode) {
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
    
    // draw ghost line
    /*
    if (draw_mode) {
        let ghost_point = {'x': ghost_x, 'y': ghost_y, 'color': 'red'};
        if (ghost_start != null) {
            drawLine({'start': ghost_start, 'end': ghost_point, 'color': 'red'}, ctx);
        }
        drawPoint(ghost_point, ctx);
    }*/


    //drawLine(tmp, ctx);
}

