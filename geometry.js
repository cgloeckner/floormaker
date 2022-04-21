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

function getPointAt(x, y, ignore) {
    for (i in points) {
        if (points[i] == ignore) {
            continue;
        }
        if (points[i].x == x && points[i].y == y) {
            return points[i];
        }
    }
    return null;
}
