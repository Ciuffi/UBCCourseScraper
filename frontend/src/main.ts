import Vue from 'vue';
import VueFire from 'vuefire';
import axios from 'axios';
import VueAxios from 'vue-axios';
import App from './App.vue';
import router from './router';

Vue.use(VueAxios, axios);
Vue.use(VueFire);
Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
