import Vue from 'vue'
import ol from '../../../src/index.js'

describe('Map.vue', () => {
  it('should render correct contents', () => {
    const Constructor = Vue.extend(Hello)
    const vm = new Constructor().$mount()
    expect(vm.$el.querySelector('.hello h1').textContent)
      .to.equal('Welcome to Phantom2')
  })
})
