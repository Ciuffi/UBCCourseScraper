<template>
  <div id="ApiTester">
    <b>Last scraped at {{ ScrapeTime }}</b><br>
    <input
      v-model="Inputcode"
      type="text"
      placeholder="Enter a code!"
    >>
    <button @click="getAllDepartments">
      Get All Departments
    </button>
    <button @click="getDepartmentByCode">
      Get Department By Code
    </button>
    <button @click="getCourseByCode">
      Get Course By Department Code
    </button>
    <button @click="getSectionByCode">
      Get Section By Course Code
    </button>
    <button @click="data = {}">
      Clear
    </button>
    <pre
      id="result"
      class="prettyprint"
    >{{ theData }}</pre>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Handler from '../DBHandler';

@Component
export default class ApiTester extends Vue {
    data: any = {};

    Inputcode : string = '';

    ScrapeTime : string = '';

    mounted() {
      const script = document.createElement('script');
      script.setAttribute('src', 'https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js');
      document.head.appendChild(script);
      this.getLastScrapeTime();
    }

    get theData() : string {
      if (this.data !== null) {
        return JSON.stringify(this.data, null, 4);
      }
      return 'No data :(';
    }

    getLastScrapeTime() {
      Handler.GetLastTime().then((time) => {
        this.ScrapeTime = time.end_time;
      });
    }

    getAllDepartments() {
      Handler.getDepartments().then((deps) => {
        this.data = deps;
      });
    }

    getDepartmentByCode() {
      Handler.getDepartmentByCode(this.Inputcode).then((deps) => {
        this.data = deps;
      });
    }

    getCourseByCode() {
      Handler.getCoursesByDepartment(this.Inputcode).then((deps) => {
        this.data = deps;
      });
    }

    getSectionByCode() {
      Handler.getSectionsByCourseCode(this.Inputcode).then((deps) => {
        this.data = deps;
      });
    }
}
</script>

<style scoped>

.prettyprint{
  background: black;
}

</style>
