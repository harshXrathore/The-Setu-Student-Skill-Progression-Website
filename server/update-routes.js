const fs = require('fs');
let c = fs.readFileSync('c:/Users/harsh/Downloads/Website Dashboard Structure (1)/server/routes/courses.js', 'utf8');
if (c.includes('getQuizByLesson\r\n}')) {
    c = c.replace('getQuizByLesson\r\n}', 'getQuizByLesson,\r\n    addCourseReview\r\n}');
} else {
    c = c.replace('getQuizByLesson\n}', 'getQuizByLesson,\n    addCourseReview\n}');
}
c = c.replace("router.post('/:id/enroll', protect, enrollCourse);", "router.post('/:id/enroll', protect, enrollCourse);\nrouter.post('/:id/reviews', protect, addCourseReview);");
fs.writeFileSync('c:/Users/harsh/Downloads/Website Dashboard Structure (1)/server/routes/courses.js', c, 'utf8');
