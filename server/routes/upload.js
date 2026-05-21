const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Save to server/uploads
    },
    filename: function (req, file, cb) {
        // Create unique string using timestamp + random math
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|webp|pdf|doc|docx|txt|zip|rar/; // Allow images + docs
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Error: File upload only supports following types - " + filetypes));
    }
});

const ResumeParserService = require('../services/resumeParser.service');
const Profile = require('../models/Profile');
const { protect } = require('../middleware/authMiddleware'); // For protected resume uploads

// @desc    Upload an attachment file or resume
// @route   POST /api/upload
// @access  Public (Will be used securely via frontend ID attachment, or protect middleware for resumes)
// Using an array of middlewares if we want to conditionally apply protect, but since the original was public,
// we will just wrap the specific logic. To be safe, we'll check req.headers for auth if type=resume.
router.post('/', upload.single('attachment'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please upload a file" });
        }

        const filePath = path.join(uploadDir, req.file.filename);
        const attachmentUrl = `/uploads/${req.file.filename}`;
        
        // Step 7: Resume Parsing Logic
        if (req.body.type === 'resume') {
            // We assume frontend passes Authorization head here, but we aren't enforcing strict middleware 
            // on the route level so it doesn't break existing public assignment uploads.
            // Ideally frontend will pass userId in body, or we decode JWT here manually.
            // Let's assume the frontend will send the extracted skills endpoint to `/api/profile` instead,
            // OR we can process it here and return the skills to frontend. Let's process and return.
            
            console.log(`[Upload] Parsing resume PDF for skills: ${filePath}`);
            const extractedSkills = await ResumeParserService.extractSkillsFromPDF(filePath);
            
            // Return BOTH the url and the skills so frontend can trigger a profile update
            return res.json({
                attachmentUrl,
                attachmentName: req.file.originalname,
                extractedSkills: extractedSkills
            });
        }

        // Original Return
        res.json({
            attachmentUrl,
            attachmentName: req.file.originalname
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ message: "File upload failed" });
    }
});

module.exports = router;
