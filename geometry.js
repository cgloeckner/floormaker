var points = [];
var lines  = [];

function Point(x, y) {
    this.x     = x;
    this.y     = y;

    this.color = 'black';

    // register globally
    points.push(this);
}

function Line(start, end) {
    // end points
    this.start    = start;
    this.end      = end;
    
    this.color = 'black';
            
    // register globally
    lines.push(this);
}

/*
function Segment(line, pos=0.5) {
    // parent line
    this.line  = line;
    // relative position between line's end points [0.0, 1.0]
    this.pos   = 0.5;
}
*/

function matchToGrid(x, y) {
    return {
        'x': Math.round(x / grid_size) * grid_size,
        'y': Math.round(y / grid_size) * grid_size
    };
}

function getPointAt(x, y) {
    for (i in points) {
        // check if deleted
        if (points[i] == null) {
            // skip
            continue;
        }
        // check if positions match
        if (points[i].x == x && points[i].y == y) {
            return points[i];
        }
    }
    return null;
}

function getLineBetween(a, b) {
    for (i in lines) {
        var l = lines[i];
        if (l == null) {
            // skip
            continue
        }
        if (l.start == a && l.end == b || l.start == b && l.end == a) {
            return l;
        }
    }
    return null;
}

function removeLine(line) {
    for (i in lines) {
        if (lines[i] == line) {
            lines[i] = null;
            break;
        }
    }
}

function removePoint(point) {
    // search for line that starts/ends with this point
    for (i in lines) {
        if (lines[i] == null) {
            continue;
        }
        if (lines[i].start == point) {
            lines[i] = null;
        } else if (lines[i].end == point) {
            lines[i] = null;
        }
    }
    
    // search for point in global list
    for (i in points) {
        if (points[i] == point) {
            points[i] = null;
            break;
        }
    }
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
    let delta = r1 - r2;
    
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
    if (!isNaN(delta) && Math.abs(delta) >= 0.01) {
        return null;
    }
    
    // end points excluded
    return 0.0 < r && r < 1.0;
}

function handleSplits(point) {
    for (i in lines) {
        var line = lines[i];
        // check if deleted or is endpoint
        if (line == null || line.start == point || line.end == point) {
            // skip
            continue;
        }
        if (checkIfInside(point, line)) {
            // split into two lines
            let obj = getLineBetween(line.start, point);
            if (obj == null) {
                new Line(line.start, point); 
                line.start = point;
            }
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
    let s = (x1*(y2-y3)-x2*(y1-y3)+x3*(y1-y2)) / ((x3-x4)*(y1-y2));
    
    if (r <= 0.0 || r >= 1.0 || isNaN(r)) {
        // intersection outside line segment
        return null;
    }
    if (s <= 0.0 || s >= 1.0 || isNaN(s)) {
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
        // check if deleted, same or continued 
        if (other == null || line == other || other.end == line.start) {
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
        let p = getOrAddPoint(pos.x, pos.y);
        
        // check if not already start point
        if (p != line.start) {
            // split first line
            new Line(line.start, p);
            line.start = p;
        }

        // check if not already end point
        if (p != other.end) {
            // split second line
            new Line(other.start, p);
            other.start = p;
        }
    }
}
