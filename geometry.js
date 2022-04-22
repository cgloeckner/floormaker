var points = [];
var lines  = [];

function Point(x, y) {
    this.x     = x;
    this.y     = y;
    // array of lines associated
    this.lines = [];

    this.color = 'black';

    points.push(this);
}

function Line(start, end) {
    // end points
    this.start    = start;
    this.end      = end;
    // array of segments associated
    this.segments = [];
    
    this.color = 'black'; 

    lines.push(this);
}

function Segment(line, pos=0.5) {
    // parent line
    this.line  = line;
    // relative position between line's end points [0.0, 1.0]
    this.pos   = 0.5;
}
              
function matchToGrid(x, y) {
    return {
        'x': Math.round(x / grid_size) * grid_size,
        'y': Math.round(y / grid_size) * grid_size
    };
}

function getPointAt(x, y) {
    for (i in points) {
        if (points[i].color != 'black') {
            continue;
        }
        if (points[i].x == x && points[i].y == y) {
            return points[i];
        }
    }
    return null;
}

function checkIfInside(point, line) {
    if (line.start == null || line.end == null) {
        // skip
        return null;
    }

    // solving linear equations system
    // g: v = (x1, y1) + r*(x2-x1, y2-y1) 
    let x1 = line.start.x;
    let y1 = line.start.y;
    let x2 = line.end.x;
    let y2 = line.end.y;
    let x3 = point.x;
    let y3 = point.y;

    let r1 = (x1-x3) / (x1-x2);
    let r2 = (y1-y3) / (y1-y2);
    if (Math.abs(r1) === Infinity || Math.abs(r2) == Infinity) {
        return null;
    }

    let r = r1;
    if (isNaN(r)) {
        r = r2;
    }
    if (isNaN(r)) {
        return null;
    }
    let delta = r1 - r2;
    if (!isNaN(delta) && Math.abs(delta) >= 1.0) {
        return null;
    }
    
    // end points excluded
    return 0.0 < r && r < 1.0;
}

function handleSplits(point) {
    for (i in lines) {
        var line = lines[i];
        if (line.color != 'black') {
            // skip
            continue;
        }
        if (checkIfInside(point, line)) {
            // split into two lines
            new Line(line.start, point);
            line.start = point;
        }
    }
}


function calcIntersection(a, b) {
    if (a.start == null || a.end == null || b.start == null || b.end == null) {
        // skip
        return null;
    }
    
    // solving linear equations system
    // g: v = (x1, y1) + r*(x2-x1, y2-y1)
    // h: v = (x3, y3) + s*(x4-x3, y4-y3)
    let x1 = a.start.x;
    let y1 = a.start.y;
    let x2 = a.end.x;
    let y2 = a.end.y;
    let x3 = b.start.x;
    let y3 = b.start.y;
    let x4 = b.end.x;
    let y4 = b.end.y;

    let r = (y1-y3) / (y1-y2);
    if (r < 0.0 || r > 1.0 || isNaN(r)) {
        // intersection outside line segment
        return null;
    }

    let s = (x1*(y2-y3)-x2*(y1-y3)+x3*(y1-y2)) / ((x3-x4)*(y1-y2))
    if (s < 0.0 || s > 1.0 || isNaN(s)) {
        // intersection outside line segment
        return null;
    }

    // calculate intersection point
    let x = x1 + r*(x2-x1);
    let y = y1 + r*(y2-y1);

    return {'x': x, 'y': y};
}

function handleIntersections(line) {
    for (i in lines) {
        var other = lines[i];
        if (line == other || other.color != 'black') {
            // skip
            continue;
        }      
        let intersection = calcIntersection(line, other);
        if (intersection == null) {
            // skip
            continue
        }

        // fix intersection point
        let pos = matchToGrid(intersection.x, intersection.y);
        let p = getPointAt(pos.x, pos.y);
        if (p == null) {
            p = new Point(pos.x, pos.y);
        }
        
        // split first line
        new Line(line.start, p);
        line.start = p;

        // split second line
        new Line(other.start, p);
        other.start = p;
    }
}
