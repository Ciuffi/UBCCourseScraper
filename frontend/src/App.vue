<template>
  <div id="app">
    <Welcome></Welcome>
    <ApiTester></ApiTester>
    <ApiAccess></ApiAccess>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Welcome from './components/Welcome.vue';
import ApiAccess from './components/ApiAccess.vue';
import ApiTester from './components/ApiTester.vue';

@Component({
  components: {
    Welcome,
    ApiAccess,
    ApiTester,
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
</style>
