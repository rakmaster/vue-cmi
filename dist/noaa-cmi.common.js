var openlayers;
if(! window.ol) {
  console.log('NOAA CMI Requires Openlayers 4.0.1');
} else {

  openlayers = window.ol;

  var _defaults = {
    duration: 500,
    styles: {
      stroke: {
        color: 'rgba(0,0,0,1.0)',
        width: 1
      },
      fill: {
        color:  'rgba(0,80,180,1.0)'
      },
      text: {
        character: '\uf041',
        style: 'normal',
        size: '18px',
        family: 'FontAwesome',
        baseline: 'Bottom',
      },
      image: null
    }
  };

  var _stroke = function (stroke) {
    return new openlayers.style.Stroke({
      color: stroke.color,
      width: stroke.width
    });
  }

  var _fill = function (fill) {
    return new openlayers.style.Fill({
      color: fill.color
    });
  }

  var _text = function (text, fill) {
    return new openlayers.style.Text({
      text: text.character,
      font: text.style + ' ' + text.size + ' \'' + text.family + '\'',
      textBaseline: text.baseline,
      fill: _fill(fill)
    });
  }

  var _arrange = function (data) {
    var out = {};
    for(var v in _defaults.styles) {
      out[v] = _defaults.styles[v];
    }
    for (var d in data) {
      if(out[d]) {
        if(data[d] !== null) {
          for (var s in data[d]) {
            out[d][s] = data[d][s];
          }
        } else {
          out[d] = data[d];
        }
      }
    }
    return out;
  }

  var _style = function (data) {
    var out;
    var stl = _arrange(data);
    var source = {};
    var methods = {
      Point: function (styl) {
        if (styl.image) {
          source.image = styl.image;
        }
        if (styl.text) {
          source.text = _text(styl.text, styl.fill);
        }
        return new openlayers.style.Style(source);
      },
      LineString: function (styl) {
        if (styl.stroke) {
          source.stroke = _stroke(styl.stroke);
        }
        return new openlayers.style.Style(source);
      },
      MultiLineString: function (styl) {
        if (styl.stroke) {
          source.stroke = _stroke(styl.stroke);
        }
        return new openlayers.style.Style(source);
      },
      MultiPoint: function (styl) {
        if (styl.image) {
          source.image = styl.image;
        }
        if (styl.font) {
          source.text = _text(styl.text, styl.fill);
        }
        return new openlayers.style.Style(source);
      },
      MultiPolygon: function (styl) {
        if (styl.stroke) {
          source.stroke = _stroke(styl.stroke);
        }
        if (styl.fill) {
          source.fill = _fill(styl.fill);
        }
        return new openlayers.style.Style(source);
      },
      Polygon: function (styl) {
        if (styl.stroke) {
          source.stroke = _stroke(styl.stroke);
        }
        if (styl.fill) {
          source.fill = _fill(styl.fill);
        }
        return new openlayers.style.Style(source);
      },
      GeometryCollection: function (styl) {
        if (styl.stroke) {
          source.stroke = _stroke(styl.stroke);
        }
        if (styl.fill) {
          source.fill = _fill(styl.fill);
        }
        return new openlayers.style.Style(source);
      },
      Circle: function (styl) {
        if (styl.stroke) {
          source.stroke = _stroke(styl.stroke);
        }
        if (styl.fill) {
          source.fill = _fill(styl.fill);
        }
        return new openlayers.style.Style(source);
      }
    }
    out = methods[data.type](stl);
    return out;
  }

  var _view = function (center, zoom) {
    return new openlayers
      .View({
        center: openlayers.proj.fromLonLat(center),
        zoom: zoom
      });
  }

  var _extents = function (coords) {
    var out = openlayers.extent.boundingExtent(coords);
    return openlayers.proj.transformExtent(out, openlayers.proj.get('EPSG:4326'), openlayers.proj.get('EPSG:3857'));
  }

  var _source = {
    /**
     * __feature
     * Utility method for creating a source feature
     *
     * @param data ol.geom.*
     * @returns {ol.Feature}
     * @private
     */
    __feature: function (data, style, state) {
      var feature = new openlayers.Feature();
      feature.setGeometry(data);
      if (style) {
        feature.setStyle(style);
      }
      if (state) {
        feature.set('state', state);
      }
      return feature;
    },
    /**
     * __attributions
     * Utility method for creating source attributions. Can
     * be either a single string, or an array of strings
     *
     * @param data String | Array
     * @returns {Array(ol.Attribution)}
     * @private
     */
    __attributions: function (data) {
      var attributions = [];
      if (data) {
        if (Array.isArray(data)) {
          for (var d in data) {
            attributions.push(new openlayers.Attribution({html: data[d]}));
          }
        } else {
          var attribution = new openlayers.Attribution({
            html: data
          })
          attributions.push(attribution);
        }
      }
      return attributions;
    },
    /**
     * __normalize
     * Utility method for standardizing all point projections
     *
     * @param coordinates
     * @returns Array(transformedCoordinates)
     * @private
     */
    __normalize: function (coordinates) {
      return openlayers.proj.transform(coordinates, 'EPSG:4326', 'EPSG:3857');
    },
    /**
     * __stylize
     * Test if this feature has a unique style and apply that style
     *
     * @param data
     * @returns {ol.Style}
     * @private
     */
    __stylize: function (data) {
      var styl;
      if (data.method) {
        styl = data.method;
      } else {
        styl = _style(data);
      }
      return styl;
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
      var coords, styl, feature, state;
      if (Array.isArray(data)) {
        coords = data;
      } else {
        coords = data.coordinates;
        if (data.state) {
          state = data.state;
        }
      }
      if (typeof data.style !== 'undefined') {
        styl = _source.__stylize(data.style);
        feature = _source.__feature(new openlayers.geom.Point(_source.__normalize(coords)), styl, state);
      } else {
        feature = _source.__feature(new openlayers.geom.Point(_source.__normalize(coords)), null, state);
      }
      return feature;
    },
    /**
     * _shape
     * Create a single Polygon feature
     *
     * @param data Object
     * @returns {ol.Feature}
     */
    _shape: function (data) {
      var styl, feature;
      var vertices = [];
      for (var d = 0; d < data.coordinates.length; d++) {
        vertices.push(_source.__normalize(data.coordinates[d]));
      }
      if (typeof data.style !== 'undefined') {
        styl = _source.__stylize(data.style);
        feature = _source.__feature(new openlayers.geom.Polygon([vertices]), styl);
      } else {
        feature = _source.__feature(new openlayers.geom.Polygon([vertices]));
      }
      return feature;
    },
    /**
     * _xyz
     * Create a single tile source
     *
     * @param data Object
     * @returns {}
     */
    _xyz: function (data) {
      var attributions, url;
      if (data.attributions) {
        attributions = _source.__attributions(data.attributions);
      }
      if (data.url) {
        url = data.url;
      } else { // If there's no tiles url, we don't have a layer
        return false;
      }
      return {
        attributions: attributions,
        url: url
      };
    },
    /**
     * _image
     * Create a single image source
     *
     * @param data Object
     * @returns {}
     */
    _image: function (data) {
      // Create a "fake" layer so we can get the extents
      // where the image should place itself on our map
      var fake = _source.shape(data.coordinates);
      var extent = fake.getExtent();
      var attributions, url;
      if (data.attributions) {
        attributions = _source.__attributions(data.attributions);
      }
      if (data.url) {
        url = data.url;
      } else { // If there's no image url, we don't have a layer
        return false;
      }
      return {
        attributions: attributions,
        url: url,
        imageExtent: extent
      };
    },
    /**
     * _radius
     * Create one radius feature
     *
     * @param data Object
     * @returns {ol.Feature}
     */
    _radius: function (data) {
      var styl, feature;
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
      var c = _source.__normalize(data.coordinates);
      if(typeof data.style !== 'undefined') {
        styl = _source.__stylize(data.style);
        feature = _source.__feature(new openlayers.geom.Circle(c, r), styl);
      } else {
        feature = _source.__feature(new openlayers.geom.Circle(c, r));
      }
      return feature;
    },
    /**
     * _circle
     * Create a circle from a radius
     *
     * @param data Object
     * @returns {ol.Feature}
     */
    _circle: function (data) {
      var sides, angle;
      var radius = _source._radius(data).getGeometry();
      if (data.sides) {
        sides = data.sides;
      } else {
        sides = 32;
      }
      if(data.angle) {
        angle = data.angle;
      } else {
        angle = 0;
      }
      var circle = openlayers.geom.Polygon.fromCircle(radius, sides, angle);
      var feature = _source.__feature(circle);
      return feature;
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
      return new openlayers.source.XYZ(_source._xyz(data));
    },
    /**
     * image
     * Create one image source object
     *
     * @param data
     * @returns {ol.source.ImageStatic}
     */
    image: function (data) {
      return new openlayers.source.ImageStatic(_source._image(data));
    },
    /**
     * point
     * Create one vector source with one point feature
     *
     * @param data Object
     * @returns {ol.source.Vector}
     */
    point: function (data) {
      var features = [_source._point(data)];
      var source = new openlayers.source.Vector();
      source.addFeatures(features);
      return source;
    },
    /**
     * shape
     * Create one vector source with one polygon shape feature
     *
     * @param data Object
     * @returns {ol.source.Vector}
     */
    shape: function (data) {
      var features = [_source._shape(data)];
      var source = new openlayers.source.Vector();
      source.addFeatures(features);
      return source;
    },
    /**
     * radius
     * Create one vector source with one radius shape feature
     *
     * @param data Object
     * @return {ol.source.Vector}
     */
    radius: function (data) {
      var features = [_source._radius(data)];
      var source = new openlayers.source.Vector();
      source.addFeatures(features);
      return source;
    },
    /**
     * circle
     * Create one vector source with one circle shape feature
     */
    circle: function (data) {
      var features = [_source._circle(data)];
      return new openlayers.source.Vector(features);
    },
    /**
     * multi
     * Create a vector source with many features
     *
     * @param data Object
     * @return {ol.source.Vector}
     */
    multi: function (data) {
      var source = new openlayers.source.Vector();
      for (var d = 0; d < data.length; d++) {
        var method = _source['_' + data[d].type];
        source.addFeature(method(data[d]));
      }
      return source;
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
    },
    /**
     * compound
     * Create a compound shape based on a series of coordinates
     *
     * @param data Array
     * @return {ol.source.Vector}
     */
    compound: function (data) {
      var coords = [];
      var source = new openlayers.source.Vector();
      for (var d in data) {
        // Extract the geometry from the shape...
        var method = _source['_' + data[d].type];
        var shape = method(data[d]);
        var geom = shape.getGeometry().getCoordinates()[0].slice();
        if(geom.length % 2 === 0) {
          var newGeom = geom.slice();
          geom.push(newGeom[0]);
        }
        coords.push(geom);
      }
      var feature = _source.__feature(new openlayers.geom.Polygon(coords));
      source.addFeature(feature);
      return source;
    }
  }

  _layer = {
    /**
     * _vector
     * Utility method to do the standard vector layer creation
     */
    _vector: function _vector (name, source) {
      var layer = new openlayers.layer.Vector();
      layer.set('name', name);
      layer.setSource(source);
      return layer;
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
      return layer;
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
      var layer = new openlayers.layer.Tile();
      layer.set('name', name);
      layer.setSource(_source.xyz(source));
      return layer
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
      var layer = new openlayers.layer.Image();
      layer.set('name', name);
      layer.setSource(_source.image(source));
      return layer;
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
      var src = _source.shape(source);
      var layer = _layer._vector(name, src);
      if (source.style) {
        layer.setStyle(_style(source.style));
      } else {
        layer.setStyle(_style({type: 'Polygon'}));
      }
      return layer;
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
      var src = _source.radius(source);
      var layer = _layer._vector(name, src);
      if (source.style) {
        layer.setStyle(_style(source.style));
      } else {
        layer.setStyle(_style({type: 'Polygon'}));
      }
      return layer;
    },
    /**
     * circle
     * Draw a polygon shape based on a radius shape
     * Note: converts a radius shape into a series of points
     * that become a polygon that is displayed as a circle
     *
     */
    circle: function circle (name, source) {
      var src = _source.circle(source);
      var layer = _layer._vector(name, src);
      if (source.style) {
        layer.setStyle(_style(source.style));
      } else {
        layer.setStyle(_style({type: 'Polygon'}));
      }
      return layer;
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
      var src = _source.geojson(source.coordinates);
      var layer = _layer._vector(name, src);
      if (source.style) {
        layer.setStyle(_style(source.style));
      } else {
        layer.setStyle(_style({type: 'MultiPolygon'}));
      }
      return layer;
    },
    /**
     * compound
     * Draw a compound shape from two or more polygon shapes
     *
     * @param name String
     * @param source Object
     * @returns {ol.layer.Vector}
     */
    compound: function compound (name, source) {
      var src = _source.compound(source.shapes);
      var layer = _layer._vector(name, src);
      if (source.style) {
        layer.setStyle(_style(source.style));
      } else {
        layer.setStyle(_style({type: 'MultiPolygon'}));
      }
      return layer;
    },
    /**
     * multi
     * Draw multiple features in one layer from an array of feature data objects
     *
     * @param data
     * @returns {ol.layer.Vector}
     */
    multi: function multi (name, source) {
      var src = _source.multi(source);
      var layer = _layer._vector(name, src);
      if (source.style) {
        if(source.style.method) {
          layer.setStyle(source.style.method);
        } else {
          layer.setStyle(_style(source.style));
        }
      } else {
        layer.setStyle(_style({type: 'Polygon'}));
      }
      return layer;
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
    empty: function empty () {
      return new openlayers.layer.Vector();
    }
  }

  var map = function map () {
    this.ol = {};
    this.target = '';
    this.center = [0, 0];
    this.zoom = 4;
    this.extents = [];
    this.defaults = _defaults;
  };

  map.prototype.draw = function draw (target, data) {
    var layers = [];
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
        this.extents = _extents(data.extents);
      }
      if (data.styles) {
        for (var s in data.styles) {
          if (_defaults.styles[s]) {
            var style = data.styles[s];
            for (var t in style) {
              _defaults.styles[s][t] = style[t];
            }
          }
        }
      }
      if (data.base) {
        layers.push(_layer.draw(data.base));
      } else {
        layers.push(_layer.draw());
      }
    } else {
      layers.push(_layer.draw());
    }
    var mapdata = {
      target: this.target,
      layers: layers,
      view: _view(this.center, this.zoom)
    };
    if (data && data.controls === false) {
      mapdata.controls = openlayers.control.defaults({
        zoom: false,
        attribution: false,
        rotate: false
      });
    }
    this.ol = new openlayers.Map(mapdata);
    if (data.extents) {
      this.ol.getView().fit(this.extents, this.ol.getSize());
    }
    return this.ol;
  };

  map.prototype.getLayers = function getLayers (exclude) {
    var out = [];
    if (exclude) {
      this.ol.getLayers().forEach(function (lyr) {
        if (!(lyr instanceof openlayers.layer.Group)) {
          out.push(lyr);
        }
      });
    } else {
      this.ol.getLayers().forEach(function (lyr) {
        if (lyr instanceof openlayers.layer.Group) {
          lyr.getLayers().forEach(function (sublyr) {
            out.push(sublyr);
          })
        } else {
          out.push(lyr);
        }
      });
    }
    return out;
  };

  map.prototype.getLayer = function getLayer (name) {
    var out = [];
    this.getLayers().forEach(function (lyr) {
      if (name === lyr.get('name')) {
        out = lyr;
      }
    })
    return out;
  };

  map.prototype.getFeatures = function getFeatures (layer) {
    return this.getLayer(layer).getSource().getFeatures();
  };

  map.prototype.getFeature = function getFeature (layer, reference) {
    return this.getLayer(layer).getSource().getClosestFeatureToCoordinate(reference);
  };

  map.prototype.layer = function layer (data) {
    var out = _layer.draw(data);
    this.ol.addLayer(out);
    return out;
  };

  map.prototype.animate = function animate (data, interval) {
    var set = [];
    data.getLayers().forEach(function (layer) {
      set.push(layer);
    })
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

  map.prototype.panto = function panto (data) {
    if (data.extents) {
      var extent = _extents(data.extents);
      this.ol.getView().fit(extent, {duration: this.duration});
    }
    if (data.zoom) {
      this.ol.getView().animate({
        center: openlayers.proj.fromLonLat(data.center),
        duration: data.duration,
        zoom: data.zoom
      });
    }
  };

  map.prototype.normalize = function normalize (data) {
    return openlayers.proj.transform(data.coordinates, data.from, data.to);
  };

  function load (cb) {
    if (document.readyState === 'complete') {
      return setTimeout(cb, 0)
    }

    if (document.readyState === 'interactive') {
      return setTimeout(function () { return load(cb); }, 150)
    }

    document.addEventListener('DOMContentLoaded', cb)
  }

  function plugin (Vue, options) {

    var OLMap = Vue.extend({
      template: '<div></div>',
      props: {
        mapdata: Object
      },
      data: function data () {
        return this.mapdata;
      }
    });
    Vue.component('v-map', OLMap);

    Vue.map = new _map();

    Vue.prototype.$cmi = {
      load: load(),
      map: function (target, data) {
        return Vue.map.draw(target, data);
      },
      layer: {
        getLayers: function (exclude) {
          return Vue.map.getLayers(exclude);
        },
        getLayer: function (name) {
          return Vue.map.getLayer(name);
        },
        getFeatures: function (layer) {
          return Vue.map.getFeatures(layer);
        },
        getFeature: function (layer, ref) {
          return Vue.map.getFeature(layer, ref);
        },
        draw: function (data) {
          return Vue.map.layer(data);
        }
      },
      control: {
        animate: function (data) {
          return Vue.map.animate(data);
        },
        panto: function (data) {
          return Vue.map.panto(data);
        }
      },
      functions: {
        normalize: function (data) {
          return Vue.map.normalize(data);
        }
      }
    }
  }

  if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(plugin);
  }
}
