const grid_size = 24;

/// Snap a position to the grid
function snapToGrid(x, y) {
    return {
        'x': Math.round(x / grid_size) * grid_size,
        'y': Math.round(y / grid_size) * grid_size
    };
}

// --------------------------------------------------------------------

var points = []

/// Create a new point
function Point(x, y) {
    this.x     = x
    this.y     = y
    this.color = foreground_color
}

/// Add point to draw list
function addPoint(point) {
    points.push(point)
}

/// Unlink point from the given polygon
function unlinkPoint(point, polygon) {
    let not_this = function(v) { return v != point }
    polygon.points = polygon.points.filter(not_this)
}

/// Remove point from draw list, unlink from all polygons
function removePoint(point) {
    for (i in polygons) {
        unlinkPoint(point, polygons[i])
        refreshPolygon(polygons[i])
    }

    let not_this = function(v) { return v != point; };
    points = points.filter(not_this)
}

/// Calculate squared distance between two points
function getSquaredDistance(a, b) {
    let dx = a.x - b.x;
    let dy = a.y - b.y;
    return dx*dx + dy*dy;
}

/// Query point at given position
function getPointAt(x, y, ignore=null) {
    let tmp = new Point(x, y)
    
    for (i in points) {
        if (ignore != null && points[i] == ignore) {
            // skip
            continue
        }
        // check if position matches
        let distance = getSquaredDistance(tmp, points[i]);
        if (distance < grid_size * 0.5) {
            return points[i];
        }
    }
    return null;
}

/// Either query or create point at given position
function getOrAddPoint(x, y) {
    // try to fetch point
    let obj = getPointAt(x, y);
    if (obj == null) {
        // create it
        obj = new Point(x, y);
        addPoint(obj)

        // handle lines being split by this point
        // FIXME
        //handleSplits(obj);
    }
    
    return obj;
}

/// Merge two points, remove one
function mergePoints(keep, drop) {
    // replace references
    for (i in polygons) {
        var p = polygons[i];
        var j = p.points.indexOf(drop)
        p.points[j] = keep
    }

    removePoint(drop);
}

/// Check whether the given point is between points a and b
function checkBetween(point, a, b, maxDelta=0.01) {
    // solving linear equations system
    // g: v = (x1, y1) + r*(x2-x1, y2-y1) 
    let x1 = a.x;
    let y1 = a.y;
    let x2 = b.x;
    let y2 = b.y;
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
    if (!isNaN(delta) && Math.abs(delta) >= maxDelta) {
        return null;
    }
    
    // end points excluded
    return 0.0 < r && r < 1.0;
}

// --------------------------------------------------------------------

var polygons = []

/// Create a polygon
function Polygon(label, points) {
    this.label  = label
    this.points = points
    this.color  = foreground_color
    
    refreshPolygon(this)
}

/// Add polygon to draw list
function addPolygon(poly) {
    polygons.push(poly);
}

/// Remove polygon from draw list
function removePolygon(poly) {
    let not_this = function(v) { return v != poly; };
    polygons = polygons.filter(not_this);
}

/// Reposition polygon's label
function refreshPolygon(poly) {
    /// FIXME instead use: https://gis.stackexchange.com/questions/414260/how-does-geopandas-representative-point-work
    
    poly.center = new Point(0, 0)
    for (i in poly.points) {
        poly.center.x += poly.points[i].x
        poly.center.y += poly.points[i].y
    }
    poly.center.x /= poly.points.length
    poly.center.y /= poly.points.length
}

/// Query polygon label at given position
function getPolygonAt(x, y) {
    let tmp = new Point(x, y)
    
    for (i in polygons) {
        // check if position matches
        let distance = getSquaredDistance(tmp, polygons[i].center);
        if (distance < grid_size * 10) {
            return polygons[i];
        }
    }
}

/// Advance a polygon with another point
function advancePolygon(point, poly) {
    // check whether the point is already part of the polygon
    for (i in poly.points) {
        if (point.x == poly.points[i].x && point.y == poly.points[i].y) {
            // drop all points before that
            poly.points = poly.points.slice(i)
            
            // polygon is now a cycle
            if (!$('#link')[0].checked) {
                removePoint(point)
            }
            return true
        }
    }

    poly.points.push(point)
    return false
}

/// Add the given point to the polygon AFTER index
function mergeInto(point, polygon, index) {
    let left  = polygon.points.slice(0, index+1)
    let right = polygon.points.slice(index+1)
    polygon.points = left.concat([point], right)
}

/// Checks for all polygons that may get this point
function checkPolygonMerge(point) {
    // figure out which polygon is affected
    for (i in polygons) {
        let poly    = polygons[i]
        let changed = false

        // check all successive points
        let n = poly.points.length - 1
        for (let j = 0; j < n; ++j) {
            if (checkBetween(point, poly.points[j], poly.points[j+1])) {
                mergeInto(point, poly, j)
                changed = true
                break
            }
        }
        
        // also check first and last point
        if (checkBetween(point, poly.points[n], poly.points[0])) {
            mergeInto(point, poly, n) 
            changed = true
        }

        if (changed) {
            refreshPolygon(poly)
        }
    }
}

// --------------------------------------------------------------------
// --------------------------------------------------------------------
// --------------------------------------------------------------------

/// Calculate intersection from two lines, given by points a, b and c, d
function calcIntersection(a, b, c, d) {
    // using a linear equations system
    // g: x = a + r * (b-a)
    // h: x = c + s * (d-c)
    
    // calculate intersection parameters
    let r = a.x * (c.y - d.y) - a.y * (c.x - d.x) + c.x * d.y - c.y * d.x
    r /= (a.x * (c.y - d.y) - a.y * (c.x - d.x) - b.x * (c.y - d.y) + b.y * (c.x - d.x))
    
    let s = -(a.x * (b.y - c.y) - a.y * (b.x - c.x) + b.x * c.y - b.y * c.x)
    s /= (a.x * (c.y - d.y) - a.y * (c.x - d.x) - b.x * (c.y - d.y) + b.y * (c.x - d.x))

    // calculate intersection point
    let p = new Point(a.x + r * (b.x - a.x), a.y + r * (b.y - a.y))

    return {'r': r, 's': s, 'point': p}
}

/*
/// Calculate all intersections of a line (a, b) with a polygon
function handleLineIntersection(a, b, poly) {
    let results = []
    let n = poly.points.length - 1
    
    for (let i = 0; i < n; ++i) {
        // check for intersection with polygon edge
        let result = calcIntersection(a, b, poly.points[i], poly.points[i+1])
        if (0.0 < result.r < 1.0 && 0.0 < result.s < 1.0) {
            // store result
            results.push(result)
        }
    }
    
    // also check with last line
    let result = calcIntersection(a, b, poly.points[n], poly.points[0])
    if (0.0 < result.r < 1.0 && 0.0 < result.s < 1.0) {
        // store result
        results.push(result)
    }

    
}

/// Calculate all intersection points of two polygons
function calcAllIntersections(a, b) {
    let n = a.points.length - 1

    for (let i = 0; i < n; ++i) {
        handleLineIntersection(a.points[i], a.points[i+1], b)
    }  
    handleLineIntersection(a.points[n], a.points[0], b)
}
*/

/*
    if (r <= 0.0 || r >= 1.0 || isNaN(r)) {
        // intersection outside line segment
        return null;
    }
    if (s <= 0.0 || s >= 1.0 || isNaN(s)) {
        // intersection outside line segment
        return null;
    }
    
    // calculate intersection point



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
        let pos = snapToGrid(intersection.x, intersection.y);
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
*/
