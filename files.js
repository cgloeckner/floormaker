function saveToFile(fname) {
    // consolidate
    let not_null = function(v, i, ar) { return v != null; }
    points = points.filter(not_null);
    lines  = lines.filter(not_null);
    labels = labels.filter(not_null);

    // fetch relevant data
    let pts  = [];
    let lns  = [];
    let lbls = [];
    for (i in points) {
        if (points[i].color == null) {
            // skip
            continue;
        }
        pts.push({'x': points[i].x, 'y': points[i].y})
    }
    for (i in lines) {
        if (lines[i].start == null || lines[i].end == null) {
            // skip
            continue;
        }
        lns.push({'start': points.indexOf(lines[i].start),
            'end': points.indexOf(lines[i].end)});
    }
    for (i in labels) {
        let lbl = labels[i];
        let list = [];
        for (j in lbl.points) {
            list.push(points.indexOf(lbl.points[j]));
        }
        lbls.push({'text': lbl.text, 'points': list});
    }
    
    raw = JSON.stringify({'points': pts, 'lines': lns, 'labels': lbls});

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
    let upload = $('#load');
    if (upload[0].files.length == 0) {
        // skip
        return
    }

    let reader = new FileReader();
    reader.onload = function() {
        // parse data
        parsed = JSON.parse(reader.result);
        points = [];
        lines  = [];
        labels = [];
        for (i in parsed.points) {
            let p = parsed.points[i];
            new Point(p.x, p.y);
        }
        for (i in parsed.lines) {
            let l     = parsed.lines[i];
            let start = points[l.start];
            let end   = points[l.end];
            new Line(start, end);
        }
        for (i in parsed.labels) {
            let l = parsed.labels[i];
            let pts = [];
            for (i in l.points) {
                pts.push(points[i]);
            }
            new Label(l.text, pts);
        }

        redraw();
    }

    reader.readAsBinaryString(upload[0].files[0])
}
