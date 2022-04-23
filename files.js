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
    raw = JSON.stringify({'points': pts, 'polygons': polys})

    // offer it as a download
    let blob = new Blob([raw], {type: "text/plain"})
    saveBlob(blob, fname)
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

function exportToPNG(fname) {
    // create canvas
    let canvas    = document.createElement('canvas')
    canvas.width  = 800 * 4
    canvas.height = 450 * 4
    let context   = canvas.getContext('2d')

    // clear it transparent
    context.fillStyle = "rgba(255, 255, 255, 0.0)"
    context.fillRect(0, 0, canvas.width, canvas.height)

    // draw stuff
    context.scale(4, 4)
    drawAll(context)

    // save PNG-data to downloadable file
    let url  = canvas.toDataURL("image/png")
    let blob = getBlobFromDataURL(url)
    saveBlob(blob, fname)
}
