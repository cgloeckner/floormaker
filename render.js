function drawPoint(p, ctx) {
    if (p.color == null) {
        // skip
        return;
    }
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 3;
    ctx.beginPath()
    ctx.moveTo(p.x - 5, p.y - 5);
    ctx.lineTo(p.x + 5, p.y + 5);
    ctx.moveTo(p.x - 5, p.y + 5);
    ctx.lineTo(p.x + 5, p.y - 5);
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

    for (i in lines) {
        drawLine(lines[i], ctx);
    }  
    for (i in points) {
        drawPoint(points[i], ctx);
    }
}

