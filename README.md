# vue-cmi

Openlayers for vue.js

## Setup

Run

npm install vue-cli

After install add this to your main.js:

import VueCmi from 'vue-cmi'

Vue.use(VueCmi)

## Usage

Vue CLI is a plugin for Vue.js that allows you to have easy access to all Openlayers map drawing methods in your Vue.js application. To use Vue CLI, simply "use" it, then call the plugin inside your component.

```
import Vue from 'vue'
import CMI from 'vue-cmi'
import App from './App'

import '../node_modules/openlayers/dist/ol.css'

Vue.use(CMI)

/* eslint-disable no-new */
new Vue({
  el: '#myapp',
  store,
  template: '<App/>',
  components: { App }
})
```

Drawing a map without options is simple:

```
<template>
  <div id="app">
    <v-map id="map" :mapdata="mapdata"></v-map>
  </div>
</template>

<script>
  var em = new Vue({
    mounted () {
      this.map = this.$cmi.map('map')
    },
    data () {
      return {
        map: {}
      }
    }
  })
</script>
```

## More Details

For more details on how to use Vue CMI visit http://buriningphantom.com/vue-cmi
