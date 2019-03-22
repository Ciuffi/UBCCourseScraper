import firebase from 'firebase';

firebase.initializeApp({
  projectId: 'ubc-course-scraper-123',
});

export default class DBHandler {

    private static db = firebase.firestore();

    public static async GetLastTime(): Promise<any> {
      const scrapeDocs = await this.db.collection('scrape_times').get();
      const scrapeData = scrapeDocs.docs.pop();
      if (scrapeData === undefined) return;
      return scrapeData.data();
    }

    public static async getDepartmentByCode(code : string) {
      const dep = await this.db.collection('departments').where('Code', '==', code).get();
      const data = dep.docs.pop();
      if (data === undefined) return null;
      return data.data();
    }

    public static async getDepartments() {
      const deps = await this.db.collection('departments').get();
      return deps.docs.length !== 0 ? deps.docs.map(doc => doc.data()) : {};
    }

    public static async getCoursesByDepartment(code : string) {
      const department = await this.db.collection('departments').where('Code', '==', code).get();
      const depData = department.docs.pop();
      if (depData === undefined) return null;
      const course = await depData.ref.collection('courses').get();
      return course.docs.length !== 0 ? course.docs.map(doc => doc.data()) : {};
    }

    public static async getSectionsByCourseCode(code : string) {
      const depCode = code.split(' ')[0];
      const department = await this.db.collection('departments').where('Code', '==', depCode).get();
      const depData = department.docs.pop();
      if (depData === undefined) return null;
      const course = await depData.ref.collection('courses').where('Code', '==', code).get();
      const courseData = course.docs.pop();
      if (courseData === undefined) return null;
      const section = await courseData.ref.collection('sections').get();
      return section.docs.map(doc => doc.data());
    }
}
