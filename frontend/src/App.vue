<template>
  <div id="app">
    <Welcome />
    <div id="nav">
      <router-link to="/">
        Api Tester
      </router-link>
      <router-link to="/about">
        API Information
      </router-link>
      <router-link to="/Readme">
        Readme for Course Scraper
      </router-link>
    </div>
    <router-view />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Welcome from './components/Welcome.vue';
@Component({
  components: {
    Welcome,
  },
})
export default class App extends Vue {}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
h1 {
    margin: 0px;
}
h2 {
    margin: 0px;
}
h3 {
    margin: 0px;
}
#nav {
  padding: 10px;
  text-align: center;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
  padding: 50px;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
