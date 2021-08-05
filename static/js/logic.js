// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
let platesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Function to Determine Size of Marker Based on the Magnitude of the Earthquake
function markerSize(magnitude) {
    if (magnitude === 0) {
    return 1;
    }
    return magnitude * 3;
};

let earthquakes = new L.LayerGroup();

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  
    L.geoJSON(data.features, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, { radius: markerSize(feature.properties.mag) });
        },

        style: function (geoJsonFeature) {
            return {
                fillColor: Color(geoJsonFeature.geometry.coordinates[2]),
                fillOpacity: 0.7,
                weight: 0.1,
                color: 'black'

            }
        },

        onEachFeature: function (feature, layer) {
            layer.bindPopup(`<h2>Location: ${feature.properties.place}</h2>
            <hr><h3>Magnitude: ${feature.properties.mag}</h3>
            <hr><h3>Depth: ${feature.geometry.coordinates[2]}</h3>
            <hr><p style="text-align:center;">Date: ${new Date(feature.properties.time)}</p>`);
        }
    }).addTo(earthquakes);
    createMap(earthquakes);
});

let plates = new L.LayerGroup();

d3.json(platesUrl).then((response) => {
    L.geoJSON(response, {
        style: function (geoJsonFeature) {
            return {
                weight: 2,
                color: 'orange'
            }
        },
    }).addTo(plates);
});

function Color(magnitude) {
    if (magnitude > 90) {
        return 'red'
    } else if (magnitude > 70) {
        return 'darkorange'
    } else if (magnitude > 50) {
        return 'orange'
    } else if (magnitude > 30) {
        return 'yellow'
    } else if (magnitude > 10) {
        return 'yellowgreen'
    } else {
        return 'green'
    }
};

function getColor(d) {
    return d > -10  ? '#800026' :
           d > 10   ? '#BD0026' :
           d > 30   ? '#E31A1C' :
           d > 50   ? '#FC4E2A' :
           d > 70   ? '#FD8D3C' :
           d > 90   ? '#FEB24C' :
                      '#FFEDA0';
};

function createMap(earthquakes) {

    // Create the base layers.
    let grayscale = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
    });

    let outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "outdoors-v11",
        accessToken: API_KEY
    });

  
    let satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "satellite-v9",
        accessToken: API_KEY
    });

  // Create a baseMaps object.
  let baseMaps = {
    "Greyscale Map": grayscale,
    "Outdoors Map": outdoors,
    "Satellite Map": satellite
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": plates
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [41.86, 12.49],
    zoom: 3,
    layers: [grayscale, earthquakes, plates]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: true
  }).addTo(myMap);

    //Create a legend for the map 
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {
    
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [-10, 10, 30, 50, 70, 90],
            labels = [];
    
            div.innerHTML += "<h4>Magnitude</h4>"
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML += 
                '<i style="background:' + Color(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
    
        return div;
    };
    
    legend.addTo(myMap);

}