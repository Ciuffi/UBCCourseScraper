//GAE
import * as admin from 'firebase-admin';
import { Department, Course, Section} from './objectInterfaces'

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});
//Local
// const serviceAccount = require('./ubc-course-scraper-123-af3901de4598');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

const db = admin.firestore();

export default class DBHandler {
  public static async courseInsert(course: Course) {
    const data: any = {
      Name: course.name,
      Code: course.code,
      URL: course.url,
      department_code: course.departmentCode,
    };
    try {
      const depCollection = db.collection('departments');
      const department = await depCollection.where('Code', '==', course.departmentCode).get()
      const depData = department.docs.pop();
      if (depData === undefined) throw Error();
      const courseCollection = depCollection.doc(depData.id).collection('courses');
      const courseDoc = await courseCollection.where('Code', '==', course.code).get();
      const courseData = courseDoc.docs.pop();
      if (courseData === undefined) throw Error();
      return courseCollection.doc(courseData.id).update(data);
    } catch (e) {
      const department = await db.collection('departments').where('Code', '==', course.departmentCode).get()
      const departmentData = department.docs.pop();
      if (departmentData === undefined) return;
      return db.collection('departments').doc(departmentData.id).collection('courses').add(data);
    }
  };
  public static async sectionInsert(section: Section) {
    const data: any = {
      Code: section.code,
      URL: section.url,
      Term: section.term,
      Days: section.days,
      'Start Time': section.startTime,
      'End Time': section.endTime,
      Type: section.type,
      Length: section.length ? section.length : '',
      course_code: section.courseCode,
      department_code: section.departmentCode
    };
    try {
      const depCollection = db.collection('departments');
      const department = await depCollection.where('Code', '==', section.departmentCode).get();
      const departmentData = department.docs.pop();
      if (departmentData === undefined) throw Error();
      const CourseCollection = depCollection.doc(departmentData.id).collection('courses');
      const course = await CourseCollection.where('Code', '==', section.courseCode).get();
      const courseData = course.docs.pop();
      if (courseData === undefined) throw Error();
      const sectionCollection = CourseCollection.doc(courseData.id).collection('sections');
      const sectionDoc = await sectionCollection.where('Code', '==', section.code).get()
      const sectionData = sectionDoc.docs.pop()
      if (sectionData === undefined) throw Error();
      return sectionCollection.doc(sectionData.id).update(data);
    } catch (e) {
      const depCollection = db.collection('departments');
      const department = await depCollection.where('Code', '==', section.departmentCode).get();
      const departmentData = department.docs.pop();
      if (departmentData === undefined) throw Error();
      const CourseCollection = depCollection.doc(departmentData.id).collection('courses');
      const course = await CourseCollection.where('Code', '==', section.courseCode).get();
      const courseData = course.docs.pop();
      if (courseData === undefined) throw Error();
      const sectionCollection = CourseCollection.doc(courseData.id).collection('sections');
      return sectionCollection.add(data);
    }
  };
  public static async timeInsert(startTime: any, endTime: any) {
    const scrapeCollection = db.collection('scrape_times');
    return scrapeCollection.add({
      start_time: startTime,
      end_time: endTime,
    });
  };
  public static async departmentInsert(department: Department): Promise<any> {
    const data = {
      Name: department.name,
      Code: department.code,
      URL: department.url,
      Faculty: department.faculty,
    };
    try {
      const departmentDoc = await db.collection('departments').where('Code', '==', department.code).get();
      const depData = departmentDoc.docs.pop();
      if (depData === undefined) throw Error();
      return depData.ref.update(data);
    } catch (e) {
      return db.collection('departments').add(data);
    }
  };
}

// module.exports.getLastTime = async () => {
//   const scrapeDocs = await db.collection('scrape_times').get();
//   return scrapeDocs.docs.pop().data();
// };

// module.exports.getDepartmentByCode = async (code, callback) => {
//   const dep = await db.collection('departments').where('Code', '==', code).get();
//   if (dep.size === 0) return null;
//   return dep.docs.map(doc => doc.data());
// };

// module.exports.getDepartments = async () => {
//   const deps = await db.collection('departments').get();
//   return deps.docs.map(doc => doc.data());
// };

// module.exports.updatedSectionInsert = async (section) => {
//   const data = {
//     Teacher: section.teacher,
//     Building: section.building,
//     Room: section.room,
//     TotalSeatsRemaining: section.totalSeatsRemaining,
//     CurrentlyRegistered: section.CurrentlyRegistered,
//     GeneralSeatsRemaining: section.generalSeatsRemaining,
//     RestrictedSeatsRemaining: section.restrictedSeatsRemaining,
//   };
//   return db.collection('sections').where('Code', '==', section.code).update(data);
// };

// module.exports.getCoursesByCode = async (code) => {
//   const course = await db.collection('department').where('Code', '==', code).collection('courses').get();
//   return course.docs.map(doc => doc.data());
// };

// module.exports.getSectionsByCode = async (code) => {
//   const dep_code = code.split(' ')[0];
//   const section = await db.collection('department').where('Code', '==', dep_code).collection('courses').where('Code', '==', code).collection('sections').get();
//   return section.docs.map(doc => doc.data());
// };

// module.exports.getAllSections = async () => {
//   const sections = await db.collection('sections').get();
//   return sections.docs.map(doc => doc.data());
// };