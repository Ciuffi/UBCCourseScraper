import Vue from 'vue';
import Router from 'vue-router';
import ApiTester from './components/ApiTester.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: ApiTester,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './components/ApiAccess.vue'),
    },
    {
      path: '/Readme',
      name: 'Readme',
      component: () => import('./components/Markdown.vue'),
      props: { MarkdownLink: 'https://raw.githubusercontent.com/Ciuffi/UBCCourseScraper/Dev/README.md' },
    },
  ],
});
