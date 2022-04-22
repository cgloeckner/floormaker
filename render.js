var ghost_x     = 0;
var ghost_y     = 0;
var ghost_start = null;

function drawPoint(p, ctx) {
    if (p.color == null) {
        // skip
        return;
    }
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 3;
    ctx.beginPath()
    ctx.moveTo(p.x - 15, p.y - 15);
    ctx.lineTo(p.x + 15, p.y + 15);
    ctx.moveTo(p.x - 15, p.y + 15);
    ctx.lineTo(p.x + 15, p.y - 15);
    ctx.stroke();
}

function drawLine(l, ctx) {
    if (l.start == null || l.end == null) {
        // skip
        return;
    }
    ctx.strokeStyle = l.color;
    ctx.lineWidth = 10;
    ctx.beginPath()
    ctx.moveTo(l.start.x, l.start.y);
    ctx.lineTo(l.end.x, l.end.y);
    ctx.stroke();
}

function redraw() {
    let ctx = $('#draw')[0].getContext('2d');    
    ctx.clearRect(0, 0, 800, 450);

    // draw lines
    for (i in lines) {
        if (lines[i] != null) {
            drawLine(lines[i], ctx);
        }
    }
    // draw points
    for (i in points) {
        if (points[i] != null) {
            drawPoint(points[i], ctx);
        }
    }

    // draw ghost line
    if (draw_mode) {
        let ghost_point = {'x': ghost_x, 'y': ghost_y, 'color': 'red'};
        if (ghost_start != null) {
            drawLine({'start': ghost_start, 'end': ghost_point, 'color': 'red'}, ctx);
        }
        drawPoint(ghost_point, ctx);
    }
}

