export interface Department {
    code: string;
    url: string;
    faculty: string;
    name: string;
  }
export interface Course {
    name: string;
    url: string;
    code: string;
    departmentCode: string;
  }
export interface Section {
    code: string;
    url: string;
    status: string;
    type: string;
    term: string;
    days: string;
    endTime: string;
    startTime: string;
    courseCode: string;
    departmentCode: string;
    length?: string;
  }