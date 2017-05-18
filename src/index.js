import _map from './map'
import Components from './components'
import Load from './util/load'

const defaults = {
  componentPrefix: 'V',
  directivePrefix: ''
}

function plugin (Vue, options) {
  options = Object.assign(defaults, (options || {}))

  Object.keys(Components).forEach(key => {
    Vue.component(`${options.componentPrefix}${key}`, Components[key])
  })

  Vue.map = new _map()

  Vue.prototype.$cmi = {
    load: Load,
    map: (target, data) => {
      return Vue.map.draw(target, data)
    },
    layer: {
      getLayers: (exclude) => {
        return Vue.map.getLayers(exclude)
      },
      getLayer: (name) => {
        return Vue.map.getLayer(name)
      },
      getFeatures: (layer) => {
        return Vue.map.getFeatures(layer)
      },
      getFeature: (layer, ref) => {
        return Vue.map.getFeature(layer, ref)
      },
      draw: (data) => {
        return Vue.map.layer(data)
      }
    },
    control: {
      animate: (data) => {
        return Vue.map.animate(data)
      },
      panto: (data) => {
        return Vue.map.panto(data)
      }
    }
  }
}

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(plugin)
}

export default plugin
