var ghost_x     = 0;
var ghost_y     = 0;
var ghost_start = null;

function drawPoint(p, ctx) {
    if (p.color == null) {
        // skip
        return;
    }
    ctx.strokeStyle = p.color;
    ctx.fillStyle   = p.color;
    ctx.lineWidth   = 1;
    ctx.beginPath()
    ctx.arc(p.x, p.y, 5, 0, 2*Math.PI);
    ctx.fill();
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

function drawLabel(l, ctx) {
    if (l.text == '') {
        // skip
        return;
    }
    ctx.font      = l.fontsize + 'pt ' + l.fontfamily;
    ctx.textAlign = 'center';
    ctx.fillStyle = l.color;
    ctx.fillText(l.text, l.x, l.y);
}

function redraw() {
    // realign labels
    for (i in labels) {
        if (labels[i] != null) {
            calcLabelPos(labels[i]);
        }
    }
    
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
    // draw labels
    for (i in labels) {
        if (labels[i] != null) {
            drawLabel(labels[i], ctx);
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



    for (i in points) {
        let tmp = {'start': points[i], 'end': mouse, 'color': 'blue'};
        let ok = true;
        for (j in lines) {
            let res = calcIntersection(tmp, lines[j]);
            if (res != null) {
                ok = false;
                break;
            }
        }
        if (ok) {
            drawLine(tmp, ctx);
        }
    }
}

