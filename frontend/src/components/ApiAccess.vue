<template>
    <div class='apiInfo'>
        <div class="gwd-div-2eq3">
            <h4 class=""> API Access</h4>
            <p class="">You use the information stored by this app in your own program through the API provided here.</p>
            <strong>/getDepartments</strong> List of all departments returns a list of all the departments as json objects that looks like this:<br>

            <pre class="">    {
                ID: int
                Name: String
                Code: String
                URL: String
                Faculty: String
            }
            </pre>
            <strong>/getDepartmentByCode?code=""</strong> List of courses by department code returns a department specified with a 'code' parameter in the post message:
            <pre class="">    {
                ID: int
                Name: String
                Code: String
                URL: String
                Faculty: String
            }
            </pre>
            <strong>/getCoursesByCode?code=""</strong> List of courses by department code returns a list of all the courses in a department specified with a 'code' parameter in the post message:
            <pre class="">    {
                ID: int
                Name: String
                Code: String
                URL: String
            }
            </pre>
            <strong>/getSectionsByCode?code=""</strong> List of sections by course code returns a list of all the sections ina course specified with a 'code' parameter in the post message:
            <pre class="">    {
                ID: int
                Code: String
                Teacher: String
                Building: String
                Room: String
                TotalSeatsRemaining: int
                CurrentlyRegistered: int
                GeneralSeatsRemaining: int
                RestrictedSeatsRemaining: int
            }
            </pre>
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable linebreak-style */
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class ApiAccess extends Vue {}
</script>

<style scoped>

</style>
