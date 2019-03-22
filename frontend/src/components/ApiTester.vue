<template>
    <div id='ApiTester'>
        <b>Last scraped at {{ScrapeTime}}</b><br>
        <input type='text' placeholder='Enter a code!' v-model="Inputcode"></input>
        <button v-on:click="getAllDepartments">getAllDepartments</button>
        <button v-on:click="getDepartmentByCode">getDepartmentByCode</button>
        <button v-on:click="getCourseByCode">getCourseByCode</button>
        <button v-on:click="getSectionByCode">getSectionByCode</button>
        <pre class="prettyprint lang-json" id="result">{{theData !== {} || theData !== null ? theData : `${Inputcode} not found`}}</pre>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Handler from '../DBHandler';

@Component
export default class ApiTester extends Vue {
    data: firebase.firestore.DocumentData = {};

    Inputcode : string = '';

    ScrapeTime : string = '';

    mounted() {
      const script = document.createElement('script');
      script.setAttribute('src', 'https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js?skin=sunburst');
      document.head.appendChild(script);
      this.getLastScrapeTime();
    }

    get theData() : string {
      return JSON.stringify(this.data, null, 4);
    }

    getLastScrapeTime() {
      Handler.GetLastTime().then((time) => {
        this.ScrapeTime = time.end_time;
      });
    }

    getAllDepartments() {
      Handler.getDepartments().then((deps) => {
        this.data = deps;
        PR.prettyPrint();
      });
    }

    getDepartmentByCode() {
      Handler.getDepartmentByCode(this.Inputcode).then((deps) => {
        this.data = deps;
        PR.prettyPrint();
      });
    }

    getCourseByCode() {
      Handler.getCoursesByCode(this.Inputcode).then((deps) => {
        this.data = deps;
        PR.prettyPrint();
      });
    }

    getSectionByCode() {
      Handler.getSectionsByCode(this.Inputcode).then((deps) => {
        this.data = deps;
        PR.prettyPrint();
      });
    }
}
</script>

<style scoped>

</style>
