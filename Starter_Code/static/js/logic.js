//get USGS earthquake data
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

d3.json(url).then(function (data){
    earthquakeMap(data);
    console.log(data);    
});

//make map

function earthquakeMap(data){
    let streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      })
    let topographyLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        });
      


//make data layers
let markers = [];
let circles = [];

//read data in
for (let x = 0; x < data.features.length; x++){
    let row = data.features[x];

    // find location
    if (row.geometry){
        let lat = row.geometry.coordinates[1];
        let long = row.geometry.coordinates[0];
        let depth = row.geometry.coordinates[2];
        let location = [lat, long];
    

    //add marker and popup
    let mag = row.properties.mag;
    let text = `<h1>${row.properties.title}</h1><hr><a href="${row.properties.url}" target="_blank">Link</a>`;
    let marker = L.marker(location).bindPopup(text);

    markers.push(marker);

    //circle colors
    let col;
    if (depth < 10) {
        col = "#4CBB17";
      } else if (depth < 30) {
        col = "#FFFF00";
      } else if (depth < 50) {
        col = "#FFA70B";
      } else if (depth < 70) {
        col = "#ff8c00";
      } else if (depth < 90) {
        col = "#FF0000";
      } else {
        col = "#7F0000";
      }

    let rad = 5000 * (mag ** 2);

    //make circles
    let circ = L.circle(location, {
        color: col,
        fillColor: col,
        fillOpacity: 0.6,
        radius: rad
    }).bindPopup(text);

    circles.push(circ);
    }
}

let markLayer = L.layerGroup(markers);
let circLayer = L.layerGroup(circles);

let bigMap = L.map("map", {
    center: [37.0902, -95.7129],
    zoom: 3,
    layers: [streetLayer, circLayer]
});

let beginningMaps = {
    Street: streetLayer,
    Topography: topographyLayer
};

let overlays = {
    Markers: markLayer,
    Circles: circLayer
};

L.control.layers(beginningMaps, overlays).addTo(bigMap);

let legend = L.control({position: "topleft"});

legend.onAdd = function (bigMap){
    let div = L.DomUtil.create("div", "legend");
    let colors = ["#4CBB17","#FFFF00","#FFA70B","#FF8C00","#FF0000","#7F0000"];
    let labels = ["-10 - 10","10 - 30", "30 - 50", "50 - 70", "70 - 90", "90+"];

    div.innerHTML += "<h3>Depth</h3>";

    for (let x = 0; x < colors.length; x++){
        div.innerHTML +=
            '<i style="background:' + colors[x] + '"></i> ' + labels[x] + '<br>';
    }
    return div;

};

legend.addTo(bigMap);
}

