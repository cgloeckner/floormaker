function saveToFile(fname) {
    // fetch relevant data
    let pts   = []
    let polys = []
    for (i in points) {
        pts.push({'x': points[i].x, 'y': points[i].y})
    }
    for (i in polygons) {
        let poly = polygons[i]
        // build list of point indices
        let list = []
        for (j in poly.points) {
            list.push(points.indexOf(poly.points[j]))
        }
        polys.push({'label': poly.label, 'points': list})
    }

    // stringify entire dump
    raw = JSON.stringify({'points': pts, 'polygons': polys});

    // offer it as a download
    let blob = new Blob([raw], {type: "text/plain"});
    let url  = window.URL || window.webkitURL;
    let link = url.createObjectURL(blob);
    var a = document.createElement('a');
    a.setAttribute('download', fname);
    a.setAttribute('href', link)
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function loadFromFile() {
    let upload = $('#load')
    if (upload[0].files.length == 0) {
        // skip
        return
    }

    // setup reader with async loading
    let reader = new FileReader();
    reader.onload = function() {
        // parse data
        parsed = JSON.parse(reader.result)
        points   = []
        polygons = []
        for (i in parsed.points) {
            let p = parsed.points[i]
            pt = new Point(p.x, p.y)
            addPoint(pt)
        }
        for (i in parsed.polygons) {
            let p   = parsed.polygons[i]
            // use already loaded points
            let pts = []
            for (j in p.points) {
                pts.push(points[p.points[j]])
            }
            let pol = new Polygon(p.label, pts)
            addPolygon(pol)
        }
        
        render()
    }

    // read file to trigger loading
    reader.readAsBinaryString(upload[0].files[0])
}
