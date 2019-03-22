import firebase from 'firebase';

firebase.initializeApp({
  projectId: 'ubc-course-scraper-123',
});

export default class DBHandler {

    private static db = firebase.firestore();

    public static async GetLastTime() {
      const scrapeDocs = await this.db.collection('scrape_times').get();
      return scrapeDocs.docs.length !== 0 ? scrapeDocs.docs.pop().data() : {};
    }

    public static async getDepartmentByCode(code : string) {
      const dep = await this.db.collection('departments').where('Code', '==', code).get();
      if (dep.size === 0) return null;
      return dep.docs.length !== 0 ? dep.docs.pop().data() : {};
    }

    public static async getDepartments() {
      const deps = await this.db.collection('departments').get();
      return deps.docs.length !== 0 ? deps.docs.map(doc => doc.data()) : {};
    }

    public static async getCoursesByCode(code : string) {
      const course = await this.db.collection('courses').where('Code', '==', code).get();
      return course.docs.length !== 0 ? course.docs.map(doc => doc.data()) : {};
    }

    public static async getSectionsByCode(code : string) {
      const section = await this.db.collection('sections').where('Code', '==', code).get();
      return section.docs.map(doc => doc.data()) ? section.docs !== undefined : {};
    }
}
