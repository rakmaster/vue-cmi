var defaults = {
  duration: 500,
  styles: {
    stroke: {
      color: 'rgba(0,0,0,1.0)',
      width: 1
    },
    fill: {
      color: 'rgba(0,80,180,1.0)'
    },
    point: {
      font: {
        character: '\uf041',
        style: 'normal',
        size: '18px',
        family: 'FontAwesome',
        baseline: 'Bottom',
      },
      color: '#000000'
    }
  }
}

var _view = function _view(center, zoom) {
  return new openlayers.View({
    center: openlayers.proj.fromLonLat(center),
    zoom: zoom
  });
};

var _extents = function(coords) {
  var out = openlayers.extent.boundingExtent(coords);
  return openlayers.proj.transformExtent(out, openlayers.proj.get('EPSG:4326'), openlayers.proj.get('EPSG:3857'));
}

var _stroke = function (stroke) {
  return new openlayers.style.Stroke({
    color: stroke.color,
    width: stroke.width
  })
}

var _fill = function (fill) {
  return new openlayers.style.Fill({
    color: fill.color
  })
}

var _text = function (text, fill) {
  return new openlayers.style.Text({
    text: text.character,
    font: text.style + ' ' + text.size + ' \'' + text.family + '\'',
    textBaseline: text.baseline,
    fill: _fill(fill)
  })
}

var _arrange = function (data) {
  var out = defaults.styles;
  for(var v in defaults.styles) {
    out[v] = defaults.styles[v]
  }
  for (var d in data) {
    if(out[d]) {
      if(data[d] !== null) {
        for (var s in data[d]) {
          out[d][s] = data[d][s]
        }
      } else {
        out[d] = data[d]
      }
    }
  }
  return out
}

_style = function (data) {
  var source = {}
  var stl = _arrange(data)

  switch(data.type) {
    case 'Point':
      if (stl.image) {
        source.image = stl.image;
      }
      if (stl.text) {
        source.text = _text(stl.text, stl.fill);
      }
      break;
    case 'LineString':
      if (stl.stroke) {
        source.stroke = _stroke(stl.stroke);
      }
      break;
    case 'MultiLineString':
      if (stl.stroke) {
        source.stroke = _stroke(stl.stroke);
      }
      break;
    case 'MultiPoint':
      if (stl.image) {
        source.image = stl.image;
      }
      if (stl.font) {
        source.text = _text(stl.text, stl.fill);
      }
      break;
    case 'MultiPolygon':
      if (stl.stroke) {
        source.stroke = _stroke(stl.stroke);
      }
      if (stl.fill) {
        source.fill = _fill(stl.fill);
      }
      break;
    case 'Polygon':
      if (stl.stroke) {
        source.stroke = _stroke(stl.stroke);
      }
      if (stl.fill) {
        source.fill = _fill(stl.fill);
      }
      break;
    case 'GeometryCollection':
      if (stl.stroke) {
        source.stroke = _stroke(stl.stroke);
      }
      if (stl.fill) {
        source.fill = _fill(stl.fill);
      }
      break;
    case 'Circle':
      if (stl.stroke) {
        source.stroke = _stroke(stl.stroke);
      }
      if (stl.fill) {
        source.fill = _fill(stl.fill);
      }
      break;
  }
  return new openlayers.style.Style(source);
};

var map = function map() {
  this.ol = {};
  this.target = '';
  this.center = [0, 0];
  this.zoom = 4;
  this.layers = [];
  this.defaults = defaults;
};

map.prototype.draw = function (target, data) {
  if (!target) {
    return false;
  } else {
    this.target = target;
  }
  if (data) {
    if (data.center) {
      this.center = data.center;
    }
    if (data.zoom) {
      this.zoom = data.zoom;
    }
    if (data.extents) {
      this.extents = openlayers.extent.boundingExtent(data.extents);
      this.extents = openlayers.proj.transformExtent(this.extents, openlayers.proj.get('EPSG:4326'), openlayers.proj.get('EPSG:3857'));
    }
    if (data.styles) {
      for (var s in data.styles) {
        if (defaults.styles[s]) {
          var style = data.styles[s];
          for(var t in style) {
            defaults.styles[s][t] = style[t];
          }
        }
      }
    }
    if (data.base) {
      this.layers.push(_layer.draw(data.base));
    } else {
      this.layers.push(_layer.draw());
    }
  } else {
    this.layers.push(_layer.draw());
  }
  var mapdata = {
    target: this.target,
    layers: this.layers,
    view: _view(this.center, this.zoom)
  };
  if(data.controls === false) {
    mapdata.controls = [
      new OpenLayers.Control.Navigation(),
      new OpenLayers.Control.ArgParser(),
      new OpenLayers.Control.Attribution()
    ]
  };
  if(data.extents) {
    this.ol.getView().fit(this.extents, this.ol.getSize());
  }
  this.ol = new openlayers.Map(mapdata);
  return this.ol;
};

map.prototype.getLayers = function (exclude) {
  var out = [];
  if (exclude) {
    this.layers.forEach(function (lyr) {
      if (!(lyr instanceof openlayers.layer.Group)) {
        out.push(lyr);
      }
    })
  } else {
    this.layers.forEach(function (lyr) {
      if (lyr instanceof openlayers.layer.Group) {
        lyr.getLayers().forEach(function (sublyr) {
          out.push(sublyr);
        })
      } else {
        out.push(lyr);
      }
    })
  }
  return out;
};
map.prototype.getLayer = function (name) {
  this.getLayers().forEach(function (lyr) {
    if (name === lyr.get('name')) {
      return lyr;
    }
  });
};
map.prototype.layer = function (data) {
  data.defaultStyle = this.defaults.styles.pointStyle;
  var out = _layer.draw(data);
  this.layers.push(out);
  this.ol.addLayer(out);
  return out;
};
map.prototype.animate = function (data, interval) {
  var set = [];
  data.getLayers().forEach(function (layer) {
    set.push(layer);
  });
  var iterant = 0;
  for (var s = 1; s < set.length; s++) {
    set[s].setVisible(false);
  }
  setInterval(function () {
    set[iterant].setVisible(!set[iterant].getVisible());
    iterant++;
    if (iterant === set.length) {
      iterant = 0;
    }
    set[iterant].setVisible(!set[iterant].getVisible());
  }, interval);
};
map.prototype.panto = function (data) {
  if(data.extents) {
    var extent = _extents(data.extents);
    this.ol.getView().fit(extent, {duration: this.duration});
  }
  if(data.zoom) {
    this.ol.getView().animate({
      center: openlayers.proj.fromLonLat(data.center),
      duration: data.duration,
      zoom: data.zoom
    });
  }
};

var _layer = {
  /**
   * _setStyle
   * Create the proper style injection
   *
   * @param data Object
   * @returns ol.style.Style
   */
  _setStyle: function _setStyle (data) {
    var out = null;
    if (Array.isArray(data)) {
      out = [];
      for (var s in data) {
        out.push(__webpack_require__.i(_style(data[s])));
      }
    } else {
      out = __webpack_require__.i(_style(data));
    }
    return out
  },
  /**
   * draw
   * Master controller for drawing a layer
   *
   * @param data Object
   * @returns ol.layer.*
   */
  draw: function draw (data) {
    var layer;
    if (!data) { // If no data, return the default OSM base layer. All maps have at least 1 layer
      layer = new openlayers.layer.Tile({name: 'base', source: _source.default()});
    } else { // Since we only ever draw one layer at a time, draw the layer passed to us
      // data.src possible values:
      // attributions : proper attribution for the source of the map data
      // url : url to the remote source for the layer
      // coordinates : array of long, lat pairs or array of array of long, lat pairs
      // style : object containing image, font, fill and stroke style assignments
      var func = this[data.type];
      layer = func(data.name, data.src);
    }
    return layer
  },
  /**
   * tile
   * Draw a layer of the type Tile that is NOT OSM.
   * Note: all layers should have a unique name so we can find them later
   *
   * @param name String
   * @param source Object
   * @returns {ol.layer.Tile}
   *
   */
  tile: function tile (name, source) {
    // source should be an object of attributions, url
    var out = {};
    out.name = name;
    out.source = _source.xyz(source);
    return new openlayers.layer.Tile(out);
  },
  /**
   * image
   * Draw a layer of the type Image
   * Note: all image layers are tied to geospacial coordinates, or they
   * will end up finding their own place somewhere you don't expect
   *
   * @param name String
   * @param source Object
   * @returns {ol.layer.Image}
   *
   */
  image: function image (name, source) {
    // source should be an object of coordinates, attributions, url
    var out = {};
    out.name = name;
    out.source = _source.image(source);
    return new openlayers.layer.Image(out);
  },
  /**
   * points
   * Draw a layer of the type Vector with one or more Point features
   * Note: each point may have a different style. If a point does not contain
   * its own style designation, the global default will be used instead
   *
   * @param name String
   * @param source Object
   * @returns {ol.layer.Vector}
   */
  points: function points (name, source) {
    // source should be an object of coordinates (array or object), style (optional)
    var out = {};
    var style = null;
    out.name = name;
    out.source = _source.points(source);
    if (source.style) {
      out.style = _setStyle(source.style);
    }
    return new openlayers.layer.Vector(out);
  },
  /**
   * shape
   * Draw a layer of the type Vector with one Shape feature
   * Note: the shape layer may have a custom style assignment. If the shape data
   * does not contain its own style designation it will use the global instead
   *
   * @param name
   * @param source
   * @returns {ol.layer.Vector|ol.source.Vector|ol.test.rendering.layer.Vector}
   */
  shape: function shape (name, source) {
    // should be an object of coordinates (array), style (optional)
    var out = {};
    var style = null;
    out.name = name;
    out.source = _source.shape(source);
    if (source.style) {
      out.style = _setStyle(source.style);
    } else {
      out.style = _style({type: 'Polygon'});
    }
    return new openlayers.layer.Vector(out);
  },
  /**
   * radius
   * Draw a layer of the type Vector with one Shape Feature
   * Note: radius draws a ciclre shape based on a single point,
   * with a radius of n miles as the boundaries of the shape
   *
   * @param name String
   * @param soruce Object
   * @returns {ol.layer.Vector}
   */
  radius: function radius (name, source) {
    // should be an object of coordinates (object), style (optional)
    var out = {};
    var style = null;
    out.name = name;
    out.source = _source.radius(source);
    if (source.style) {
      out.style = _setStyle(source.style);
    } else {
      out.style = _style({type: 'Polygon'});
    }
    return new openlayers.layer.Vector(out);
  },
  /**
   * geojson
   * Draw a layer based on a GeoJSON string
   *
   * @apram name String
   * @param source Object
   * @returns {ol.layer.Vector}
   */
  geojson: function geojson (name, source) {
    var out = {};
    var style = null;
    out.name = name;
    out.source = _source.geojson(source.coordinates);
    if (source.style) {
      out.style = _setStyle(source.style);
    } else {
      out.style = _style({type: 'MultiPolygon'});
    }
    return new ol.layer.Vector(out);
  },
  /**
   * group
   * Draw a group of layers based on an array of layer data objects
   *
   * @param data
   * @returns {module.Group|ol.layer.Group}
   */
  group: function group (name, source) {
    var layers = [];
    for (var s in source) {
      var func = _layer[source[s].type];
      layers.push(func(source[s].name, source[s].src));
    }
    return new openlayers.layer.Group({name: name, layers: layers});
  },
  /**
   * empty
   * Draw a layer with a pre-defined source
   *
   * @param data
   * @returns {ol.layer.*}
   */
  empty: function empty (name, source) {
    var out = {};
    out.name = name;
    if(source) {
      out.source = source;
    }
    return new openlayers.layer.Vector(out);
  }
};

var _source = {
  /**
   * _feature
   * Utility method for creating a source feature
   *
   * @param data ol.geom.*
   * @returns {ol.Feature}
   * @private
   */
  _feature: function (data) {
    return new openlayers.Feature({
      geometry: data
    });
  },
  /**
   * _attributions
   * Utility method for creating source attributions. Can
   * be either a single string, or an array of strings
   *
   * @param data String | Array
   * @returns {Array(ol.Attribution)}
   * @private
   */
  _attributions: function (data) {
    var attributions = [];
    if (data) {
      if (Array.isArray(data)) {
        for (var d in data) {
          attributions.push(new openlayers.Attribution({html: data[d]}));
        }
      } else {
        var attribution = new openlayers.Attribution({
          html: data
        });
        attributions.push(attribution);
      }
    }
    return attributions;
  },
  /**
   * _point
   * Utility method for creating a single point feature.
   * Points are unique in that each point can have a
   * different style aassociated with the feature
   *
   * @param data Array[longitude, latitude]
   * @returns {ol.Feature}
   * @private
   */
  _point: function (data) {
    var coords;
    if (Array.isArray(data)) {
      coords = data;
    } else {
      coords = data.coordinates;
    }
    var feature = _source._feature(new openlayers.geom.Point(_source._normalize(coords)));
    var style = null;
    if (data.style) {
      style = data.style;
      style.type = 'Point';
      feature.setStyle(_style(style));
    }
    return feature;
  },
  /**
   * _normalize
   * Utility method for standardizing all point projections
   *
   * @param coordinates
   * @returns Array(transformedCoordinates)
   * @private
   */
  _normalize: function (coordinates) {
    return openlayers.proj.transform(coordinates, 'EPSG:4326', 'EPSG:3857');
  },
  /**
   * default
   * Create the default map base source
   *
   * @returns {ol.source.OSM}
   */
  default: function () {
    return new openlayers.source.OSM();
  },
  /**
   * xyz
   * Create one xyz source object
   *
   * @param data Object
   * @returns {ol.source.XYZ}
   */
  xyz: function (data) {
    var attributions, url;
    if (data.attributions) {
      attributions = _source._attributions(data.attributions);
    }
    if (data.url) {
      url = data.url;
    } else { // If there's no tiles url, we don't have a layer
      return false;
    }
    return new openlayers.source.XYZ({
      attributions: attributions,
      url: url
    });
  },
  /**
   * image
   * Create one image source object
   *
   * @param data
   * @returns {ol.source.ImageStatic}
   */
  image: function (data) {
    // Create a "fake" layer so we can get the extents
    // where the image should place itself on our map
    var fake = _source.shape(data.coordinates);
    var extent = fake.getExtent();
    var attributions, url;
    if (data.attributions) {
      attributions = _source._attributions(data.attributions);
    }
    if (data.url) {
      url = data.url;
    } else { // If there's no image url, we don't have a layer
      return false;
    }
    return new openlayers.source.ImageStatic({
      attributions: attributions,
      url: url,
      imageExtent: extent
    });
  },
  /**
   * points
   * Create one vector source with many point features
   *
   * @param data Object
   * @returns {ol.source.Vector}
   */
  points: function (data) {
    var out = {};
    var features = [];
    for (var d = 0; d < data.length; d++) {
      features.push(_source._point(data[d]));
    }
    out.features = features;
    return new openlayers.source.Vector(out);
  },
  /**
   * shape
   * Create one vector source with one polygon shape feature
   *
   * @param data Object
   * @returns {ol.source.Vector}
   */
  shape: function (data) {
    var vertices = [];
    for (var d = 0; d < data.coordinates.length; d++) {
      vertices.push(_source._normalize(data.coordinates[d]));
    }
    var feature = _source._feature(new openlayers.geom.Polygon([vertices]));
    return new openlayers.source.Vector({features: [feature]});
  },
  /**
   * radius
   * Create one vector source with one circle shape feature
   *
   * @param data Object
   * @return {ol.source.Vector}
   */
  radius: function (data) {
    var radiusMiles = data.radius;
    var arrConversion = [];
    arrConversion['degrees'] = (1 / (60 * 1.1508));
    arrConversion['dd'] = arrConversion['degrees'];
    arrConversion['m'] = (1609.344);
    arrConversion['ft'] = (5280);
    arrConversion['km'] = (1.609344);
    arrConversion['mi'] = (1);
    arrConversion['inches'] = (63360);
    // need to multiply by sqrt(2)/2 or 1.41421356/2  because
    // were passing in RADIUS and that's a diagonal when drawing the square.  so we have to
    // adjust by root 2 so we get the actual sides in length that we want
    var r = radiusMiles * arrConversion[data.units] * (1.41421356 / 2);
    var c = new openlayers.Coordinate(_source._normalize(data.coordinates));
    var feature = _source._feature(new openlayers.geom.Circle(c, r));
    return new openlayers.source.Vector({features: feature});
  },
  /**
   * geojson
   * Create one vector source with a shape based on a GeoJSON string
   *
   * @param data Object
   * @return {ol.source.Vector}
   */
  geojson: function (data) {
    var out;
    if (data !== null && typeof data === 'object') {
      out = new openlayers.source.Vector({
        features: (new openlayers.format.GeoJSON()).readFeatures(data),
        format: new ol.format.GeoJSON()
      });
    } else if (typeof data === 'string') {
      out = new openlayers.source.Vector({
        url: data,
        format: new ol.format.GeoJSON()
      });
    }
    return out;
  }
};


var _stroke = function _stroke(color, width) {
  return new openlayers.style.Stroke({
    color: color,
    width: width
  });
};

var _fill = function _fill(color) {
  return new openlayers.style.Fill({
    color: color
  });
};

style = function (data) {
  var source;
  if (data.type === 'Point') {
    source = {
      text: new openlayers.style.Text({
        text: data.text,
        font: data.font,
        textBaseline: data.baseline,
        fill: _fill({ color: data.fillcolor })
      })
    };
  }
  if (data.type === 'Polygon') {
    source = {
      fill: _fill(data.fillcolor),
      stroke: _stroke(data.strokecolor, data.strokewidth)
    };
  }
  return new openlayers.style.Style(source);
};

function plugin(Vue) {
  if (plugin.installed) {
    return false;
  }

  var OLMap = Vue.extend({
    template: '<div></div>',
    props: {
      mapdata: Object
    },
    data: function data() {
      return this.mapdata;
    }
  });
  Vue.component('v-map', OLMap);

  Vue.map = new map();

  Vue.prototype.$ol = {
    map: function map(target, data) {
      return Vue.map.draw(target, data);
    },
    layer: {
      getLayers: function getLayers(exclude) {
        return Vue.map.getLayers(exclude);
      },
      getLayer: function getLayer(name) {
        return Vue.map.getLayer(name);
      },
      draw: function draw(data) {
        return Vue.map.layer(data);
      }
    },
    control: {
      animate: function animate(data) {
        return Vue.map.animate(data);
      },
      panto: function panto(data) {
        return Vue.map.panto(data)
      }
    }
  };
}

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(plugin);
}
