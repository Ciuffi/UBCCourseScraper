//GAE
const admin = require('firebase-admin');

// admin.initializeApp({
//   credential: admin.credential.applicationDefault(),
// });
//Local
const serviceAccount = require('./ubc-course-scraper-123-af3901de4598');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports.timeInsert = async (startTime, endTime) => {
  const scrapeCollection = db.collection('scrape_times');
  return scrapeCollection.add({
    start_time: startTime,
    end_time: endTime,
  });
};

module.exports.getLastTime = async () => {
  const scrapeDocs = await db.collection('scrape_times').get();
  return scrapeDocs.docs.pop().data();
};
module.exports.departmentInsert = async (department) => {
  const data = {
    Name: department.name,
    Code: department.code,
    URL: department.url,
    Faculty: department.faculty,
  };
  try {
    return db.collection('departments').where('Code', '==', department.code).update(data);
  } catch (e) {
    return db.collection('departments').add(data);
  }
};

module.exports.getDepartmentByCode = async (code, callback) => {
  const dep = await db.collection('departments').where('Code', '==', code).get();
  if (dep.size === 0) return null;
  return dep.docs.pop().data();
};

module.exports.getDepartments = async () => {
  const deps = await db.collection('departments').get();
  return deps.docs.map(doc => doc.data());
};

module.exports.courseInsert = async (course) => {
  const data = {
    Name: course.name,
    Code: course.code,
    URL: course.url,
  };
  try {
    return db.collection('courses').where('Code', 'LIKE', course.code).update(data);
  } catch (e) {
    return db.collection('courses').add(data);
  }
};
module.exports.sectionInsert = async (section) => {
  const data = {
    Code: section.code,
    URL: section.url,
    Term: section.term,
    Days: section.days,
    'Start Time': section.startTime,
    'End Time': section.endTime,
    Type: section.type,
    Length: section.length ? section.length : '',
  };
  try {
    return db.collection('sections').where('Code', '==', section.code).update(data);
  } catch (e) {
    return db.collection('sections').add(data);
  }
};
module.exports.updatedSectionInsert = async (section) => {
  const data = {
    Teacher: section.teacher,
    Building: section.building,
    Room: section.room,
    TotalSeatsRemaining: section.totalSeatsRemaining,
    CurrentlyRegistered: section.CurrentlyRegistered,
    GeneralSeatsRemaining: section.generalSeatsRemaining,
    RestrictedSeatsRemaining: section.restrictedSeatsRemaining,
  };
  return db.collection('sections').where('Code', '==', section.code).update(data);
};

module.exports.getCoursesByCode = async (code) => {
  const course = await db.collection('courses').where('Code', '==', code).get();
  return course.docs.map(doc => doc.data());
};

module.exports.getSectionsByCode = async (code) => {
  const section = await db.collection('sections').where('Code', '==', code).get();
  return section.docs.map(doc => doc.data());
};

module.exports.getAllSections = async () => {
  const sections = await db.collection('sections').get();
  return sections.docs.map(doc => doc.data());
};