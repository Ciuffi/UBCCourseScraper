const Knex = require('knex');

const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS ? process.env.DB_PASS : '',
  database: process.env.DB_NAME,
};

const knex = Knex({
  client: 'pg',
  connection: config,
  pool: { min: 2, max: 90 },
  acquireConnectionTimeout: 300000,
});

module.exports.timeInsert = (startTime, endTime) => {
  knex('scrapeTimes').insert({
    startDate: startTime,
    endDate: endTime,
  }).then((res) => {
    console.log(`Inserted new time: ${endTime}`);
  });
};
module.exports.getLastTime = (callback) => {
  knex.select('*').from('scrapeTimes').then((results) => {
    callback(results[0]);
  });
};
module.exports.departmentInsert = (department) => {
  knex('Departments').where('Code', '=', department.code)
    .update({
      Name: department.name,
      Code: department.code,
      URL: department.url,
      Faculty: department.faculty,
    }).then((res) => {
      if (res === 0) {
        knex('Departments').insert({
          Name: department.name,
          Code: department.code,
          URL: department.url,
          Faculty: department.faculty,
        }).then((result) => {
          console.log(`Sucessfully added department: ${department.name}`);
        });
      } else {
        console.log(`Sucessfully updated department: ${department.name}`);
      }
    });
};
module.exports.getDepartmentByCode = (code, callback) => {
  knex('Departments').select('*').where('Code', 'like', `%${code}%`).then((res) => {
    if (res.length >= 1) {
      callback(res);
    } else {
      callback('Not found :(');
    }
  });
};
module.exports.getDepartments = (callback) => {
  knex('Departments').select('*').then((res) => {
    callback(res);
  });
};
module.exports.courseInsert = (course) => {
  knex('Courses').where('Code', '=', course.code)
    .update({
      Name: course.name,
      Code: course.code,
      URL: course.url,
    }).then((res) => {
      if (res === 0) {
        knex('Courses').insert({
          Name: course.name,
          Code: course.code,
          URL: course.url,
        }).then((res) => {
          console.log(`Sucessfully added course: ${course.name}`);
        });
      } else {
        console.log(`Sucessfully updated course: ${course.name}`);
      }
    });
};
module.exports.sectionInsert = (section) => {
  knex('Sections').where('Code', '=', section.code)
    .update({
      Code: section.code,
      URL: section.url,
      Term: section.term,
      Days: section.days,
      'Start Time': section.startTime,
      'End Time': section.endTime,
      Type: section.type,
      Length: section.length,
    }).then((res) => {
      if (res === 0) {
        knex('Sections').insert({
          Code: section.code,
          URL: section.url,
          Term: section.term,
          Days: section.days,
          'Start Time': section.startTime,
          'End Time': section.endTime,
          Type: section.type,
          Length: section.length,
        }).then((res) => {
          console.log(`Sucessfully added section: ${section.code}`);
        });
      } else {
        console.log(`Sucessfully updated section: ${section.code}`);
      }
    });
};

module.exports.updatedSectionInsert = (section) => {
  knex('Sections').where('Code', '=', section.code)
    .update({
      Teacher: section.teacher,
      Building: section.building,
      Room: section.room,
      TotalSeatsRemaining: section.totalSeatsRemaining,
      CurrentlyRegistered: section.CurrentlyRegistered,
      GeneralSeatsRemaining: section.generalSeatsRemaining,
      RestrictedSeatsRemaining: section.restrictedSeatsRemaining,
    }).then((res) => {
      console.log(`Section ${section.code} fully updated`);
    });
};

module.exports.getCoursesByCode = (code, callback) => {
  knex('Courses').select('*').where('Code', 'like', `%${code}%`).then((res) => {
    if (res.length >= 1) {
      callback(res);
    } else {
      callback('Not found :(');
    }
  });
};

module.exports.getSectionsByCode = (code, callback) => {
  knex('Sections').select('*').where('Code', 'like', `%${code}%`).then((res) => {
    if (res.length >= 1) {
      callback(res);
    } else {
      callback('Not found :(');
    }
  });
};

module.exports.getAllSections = (callback) => {
  knex('Sections').select('*').then((res) => {
    callback(res);
  });
};
