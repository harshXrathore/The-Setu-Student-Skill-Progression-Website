const fs = require('fs');
let c = fs.readFileSync('c:/Users/harsh/Downloads/Website Dashboard Structure (1)/server/controllers/courseController.js', 'utf8');
c = c.replace(/const Review = require\('\.\.\/models\/Review'\);\r?\nconst UserCourseProgress = require\('\.\.\/models\/UserCourseProgress'\);\r?\n\r?\nconst Review = require\('\.\.\/models\/Review'\);\r?\nconst UserCourseProgress = require\('\.\.\/models\/UserCourseProgress'\);/g, "const Review = require('../models/Review');\nconst UserCourseProgress = require('../models/UserCourseProgress');");
fs.writeFileSync('c:/Users/harsh/Downloads/Website Dashboard Structure (1)/server/controllers/courseController.js', c);
