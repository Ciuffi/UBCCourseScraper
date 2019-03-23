<template>
  <div class="Markdown">
    <vue-markdown :source="readme">
      {{ readme }}
    </vue-markdown>
  </div>
</template>

<script lang="ts">
/* eslint-disable linebreak-style */
import { Prop, Vue, Component } from 'vue-property-decorator';
import VueMarkdown from 'vue-markdown';
@Component({
  components: {
    VueMarkdown,
  },
})
export default class Readme extends Vue {
    readme: string = '';

    @Prop() MarkdownLink!: string;

    mounted() {
      this.getReadmeData();
    }

    async getReadmeData() {
      const response = await this.axios.get(this.MarkdownLink);
      this.readme = response.data;
    }
}
</script>

<style scoped>

</style>
