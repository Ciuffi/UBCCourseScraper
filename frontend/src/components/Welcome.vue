<template>
  <div class="welcome">
    <h1>UBC Course Scraper</h1>
    <p>
      Welcome to the UBC course database. This website is the home of a
      third party tool that scrapes and stores all the information on the UBC
      course website so that it can be easily accessed through an API.
      Anyone is welcome to use it but please do not
      spam the server.
    </p>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator';

export default class Welcome extends Vue {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.welcome {
    text-align: center;
}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
