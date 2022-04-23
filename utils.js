/// Fetch a data blob from a data url
function getBlobFromDataURL(url) {
    var arr  = url.split(',')
    var mime = arr[0].match(/:(.*?);/)[1]
    var bstr = atob(arr[1])
    var n = bstr.length
    var u8arr = new Uint8Array(n)
    while (n--) {
         u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], {type: mime})
}

/// Saves a data blob to a file, offered as download
function saveBlob(blob, fileName) {
    var a = document.createElement("a")
    document.body.appendChild(a)
    a.style = "display: none"
    var url = window.URL.createObjectURL(blob)
    a.href = url
    a.download = fileName
    a.click()
    window.URL.revokeObjectURL(url)
};
