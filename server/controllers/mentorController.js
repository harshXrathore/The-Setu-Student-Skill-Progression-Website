const Profile = require('../models/Profile');
const Session = require('../models/Session');
const User = require('../models/User');
const Roadmap = require('../models/Roadmap');
const MentorRecord = require('../models/MentorRecord');
const Notification = require('../models/Notification');
const { addPoints, logActivity, triggerMilestone } = require('../services/gamification.service');
const { toZonedTime, format } = require('date-fns-tz');

// @desc    Get all mentors
// @route   GET /api/mentors
// @access  Public
const getAllMentors = async (req, res) => {
    try {
        // Find verified profiles where role is mentor
        const profiles = await Profile.find({ 'occupation.role': 'mentor' })
            .populate({
                path: 'user',
                match: { isVerified: true, isVerifiedMentor: true }, // Only get fully verified mentors
                select: 'name email avatar isVerified isVerifiedMentor'
            });

        // The match above will return null for the user field if they are not verified
        // So we filter out the profiles where user is null
        const verifiedMentors = profiles.filter(profile => profile.user != null);

        res.json(verifiedMentors);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// @desc    Update session status (Accept/Decline)
// @route   PUT /api/mentors/sessions/:id/status
// @access  Private (Mentors only)
const updateSessionStatus = async (req, res) => {
    try {
        const { status, newDate, newNotes } = req.body;
        const sessionId = req.params.id;

        const session = await Session.findById(sessionId).populate('mentor', 'name');

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Allow updates from either student or mentor depending on the action
        // Students can accept a Pending Reschedule
        const isMentor = session.mentor._id.toString() === req.user.id.toString();
        const isStudent = session.student.toString() === req.user.id.toString();
        
        if (!isMentor && !isStudent) {
            return res.status(403).json({ message: 'Not authorized to update this session' });
        }

        if (!['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Pending Reschedule'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        session.status = status;

        if (status === 'Completed' && req.body.duration) {
            session.duration = req.body.duration;
        }

        // Handle status transitions
        let notificationMsg = `Your session request with ${session.mentor.name} has been ${status.toLowerCase()}.`;
        let recipientId = session.student; // Default recipient is the student

        if (status === 'Confirmed') {
            if (req.body.meetingUrl) {
                session.meetingUrl = req.body.meetingUrl;
            }
            if (newDate) { // Edge case: legacy flow or mentor confirming & changing time instantly
                session.date = new Date(newDate);
                if (newNotes) session.notes = (session.notes ? session.notes + '\n\nMentor Reschedule Note: ' : 'Mentor Reschedule Note: ') + newNotes;
                notificationMsg = `Your session with ${session.mentor.name} was approved for a rescheduled time: ${session.date.toLocaleString()}.`;
            } else if (isStudent) {
                // Student accepting a Pending Reschedule
                notificationMsg = `Your student has accepted the rescheduled time for ${new Date(session.date).toLocaleString()}.`;
                recipientId = session.mentor._id; // Route notification to mentor
            } else {
                notificationMsg = `Your session request with ${session.mentor.name} for ${new Date(session.date).toLocaleString()} has been approved.`;
            }
        } else if (status === 'Pending Reschedule') {
            if (newDate) {
                session.date = new Date(newDate);
                if (newNotes) session.notes = (session.notes ? session.notes + '\n\nMentor Proposed Note: ' : 'Mentor Proposed Note: ') + newNotes;
                notificationMsg = `${session.mentor.name} has proposed a new time for your session: ${session.date.toLocaleString()}. Please review it.`;
            }
        } else if (status === 'Completed') {
            notificationMsg = `Your session with ${session.mentor.name} is now complete. Please verify your new gamification XP!`;
        }

        const updatedSession = await session.save();

        // Create Notification for the Student
        // Create Notification
        if (recipientId) {
            await Notification.create({
                recipient: recipientId,
                title: status === 'Confirmed' ? 'Session Approved' : status === 'Pending Reschedule' ? 'Session Reschedule Proposal' : 'Session Update',
                message: notificationMsg,
                type: status === 'Confirmed' ? 'success' : status === 'Pending Reschedule' ? 'info' : 'warning'
            });

            // Gamification hooks for both parties when session completes
            if (status === 'Completed') {
                try {
                    const studentId = session.student.toString();
                    await addPoints(studentId, 30);
                    await logActivity(studentId, 'mentor_session_attended');
                    await triggerMilestone(studentId, 'First Mentor Session');

                    // Award 30 pts to Mentor as well
                    const mentorIdStr = session.mentor._id.toString();
                    await addPoints(mentorIdStr, 30);
                    await logActivity(mentorIdStr, 'mentor_session_completed');
                } catch (gamErr) {
                    console.error('[Gamification] updateSessionStatus hook error:', gamErr);
                }
            }
        }

        res.json(updatedSession);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// @desc    Book a session
// @route   POST /api/mentors/book
// @access  Private
const bookSession = async (req, res) => {
    try {
        const { mentorId, topic, date, notes, studentTimezone } = req.body;

        // Verify mentor exists
        const mentorUser = await User.findById(mentorId);
        if (!mentorUser) {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        // Validate time against mentor's availability
        const mentorProfile = await Profile.findOne({ user: mentorId });
        if (mentorProfile && mentorProfile.mentorDetails && mentorProfile.mentorDetails.availability && mentorProfile.mentorDetails.availability.length > 0) {
            const requestedDate = new Date(date);
            const mentorZone = mentorProfile.mentorDetails.timezone || 'UTC';
            const zonedDate = toZonedTime(requestedDate, mentorZone);

            const requestedDay = format(zonedDate, 'EEEE', { timeZone: mentorZone });
            const requestedTimeStr = format(zonedDate, 'HH:mm', { timeZone: mentorZone });

            const dayAvailability = mentorProfile.mentorDetails.availability.find(a => a.day === requestedDay);

            if (!dayAvailability) {
                return res.status(400).json({ message: `Mentor is not available on ${requestedDay}s.` });
            }

            let isTimeValid = false;
            if (dayAvailability.slots && dayAvailability.slots.length > 0) {
                for (const slot of dayAvailability.slots) {
                    if (requestedTimeStr >= slot.startTime && requestedTimeStr <= slot.endTime) {
                        isTimeValid = true;
                        break;
                    }
                }

                if (!isTimeValid) {
                    return res.status(400).json({
                        message: `Requested time is outside mentor's available hours for ${requestedDay}. Available slots: ${dayAvailability.slots.map(s => `${s.startTime}-${s.endTime}`).join(', ')}.`
                    });
                }
            }
        }

        const mentorZone = mentorProfile?.mentorDetails?.timezone || 'UTC';

        const session = new Session({
            mentor: mentorId,
            student: req.user.id,
            topic,
            date,
            notes,
            mentorTimezone: mentorZone,
            studentTimezone: studentTimezone || 'UTC'
        });

        const savedSession = await session.save();
        console.log("Session saved successfully:", savedSession._id);

        // Query the student's name for the notification message
        const studentUser = await User.findById(req.user.id).select('name');
        const studentName = studentUser ? studentUser.name : 'A student';
        console.log("Preparing notification for mentor:", mentorId);

        // Alert the mentor
        const newNotif = await Notification.create({
            recipient: mentorId,
            title: 'New Session Request',
            message: `${studentName} has requested a session with you on ${topic}.`,
            type: 'info',
            link: '/mentor-dashboard/sessions'
        });
        console.log("Notification created successfully:", newNotif._id);

        res.json(savedSession);
    } catch (error) {
        console.error("Error in bookSession:", error);
        res.status(500).send('Server Error');
    }
};

// @desc    Get sessions for current user (as student or mentor)
// @route   GET /api/mentors/sessions
// @access  Private
const getMySessions = async (req, res) => {
    try {
        // Find sessions where user is either student or mentor
        const sessions = await Session.find({
            $or: [{ student: req.user.id }, { mentor: req.user.id }]
        })
            .populate('mentor', 'name')
            .populate('student', 'name')
            .sort({ date: 1 });

        res.json(sessions);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all students for a mentor
// @route   GET /api/mentors/students
// @access  Private
const getMyStudents = async (req, res) => {
    try {
        // Find all sessions where this user is the mentor
        const sessions = await Session.find({ mentor: req.user.id })
            .populate('student', 'name email avatar')
            .sort({ date: -1 });

        // Extract unique students
        const studentMap = new Map();

        for (const session of sessions) {
            if (!session.student) continue;

            const studentId = session.student._id.toString();

            if (!studentMap.has(studentId)) {
                // Determine last active date (just using the most recent session date for now)
                const lastActive = session.date;

                studentMap.set(studentId, {
                    id: studentId,
                    name: session.student.name,
                    email: session.student.email,
                    avatar: session.student.avatar,
                    lastActive: lastActive,
                    focus: 'Unknown', // Will be populated from profile if available
                    progress: 0, // Will be calculated dynamically
                    status: 'Active' // Default placeholder
                });
            }
        }

        const uniqueStudents = Array.from(studentMap.values());

        // Enrich with Profile (focus/occupation) and Roadmap (progress)
        const enrichedStudents = await Promise.all(uniqueStudents.map(async (st) => {
            // Get profile focus
            const profile = await Profile.findOne({ user: st.id });
            if (profile && profile.learningGoals && profile.learningGoals.focus) {
                st.focus = profile.learningGoals.focus;
            } else if (profile && profile.occupation && profile.occupation.major) {
                st.focus = profile.occupation.major;
            }

            // Get roadmaps to calculate progress
            const roadmap = await Roadmap.findOne({ user: st.id }).sort({ generatedAt: -1 });
            if (roadmap && roadmap.roadmapPhases) {
                let totalSkills = 0;
                let completedSkills = 0;

                roadmap.roadmapPhases.forEach(phase => {
                    if (phase.skills) {
                        phase.skills.forEach(skill => {
                            totalSkills++;
                            if (skill.status === 'completed' || skill.status === 'verified') {
                                completedSkills++;
                            }
                        });
                    }
                });

                if (totalSkills > 0) {
                    st.progress = Math.round((completedSkills / totalSkills) * 100);
                }
            }

            return st;
        }));

        res.json(enrichedStudents);
    } catch (error) {
        console.error("Failed to get students:", error);
        res.status(500).send('Server Error');
    }
};

// @desc    Get a single student's profile info (mentor view) — avoids N+1 full-roster fetch
// @route   GET /api/mentors/students/:id
// @access  Private
const getSingleStudent = async (req, res) => {
    try {
        const studentId = req.params.id;

        // Authorization check: ensure this student actually has a session with THIS mentor
        const session = await Session.findOne({
            mentor: req.user.id,
            student: studentId
        }).sort({ date: -1 }).populate('student', 'name email avatar');

        if (!session || !session.student) {
            return res.status(403).json({ message: 'Not authorized to view this student' });
        }

        const st = session.student;

        // Compute focus from profile
        let focus = 'Unknown';
        const profile = await Profile.findOne({ user: studentId });
        if (profile && profile.learningGoals && profile.learningGoals.focus) {
            focus = profile.learningGoals.focus;
        } else if (profile && profile.occupation && profile.occupation.major) {
            focus = profile.occupation.major;
        }

        // Compute roadmap progress
        let progress = 0;
        const roadmap = await Roadmap.findOne({ user: studentId }).sort({ generatedAt: -1 });
        if (roadmap && roadmap.roadmapPhases) {
            let totalSkills = 0;
            let completedSkills = 0;
            roadmap.roadmapPhases.forEach(phase => {
                if (phase.skills) {
                    phase.skills.forEach(skill => {
                        totalSkills++;
                        if (skill.status === 'completed' || skill.status === 'verified') completedSkills++;
                    });
                }
            });
            if (totalSkills > 0) progress = Math.round((completedSkills / totalSkills) * 100);
        }

        res.json({
            id: st._id.toString(),
            name: st.name,
            email: st.email,
            avatar: st.avatar,
            lastActive: session.date,
            focus,
            progress,
            status: 'Active'
        });
    } catch (error) {
        console.error('Failed to get single student:', error);
        res.status(500).send('Server Error');
    }
};

// @desc    Get a student's roadmap (mentor view)
// @route   GET /api/mentors/students/:id/roadmap
// @access  Private
const getStudentRoadmap = async (req, res) => {
    try {
        const studentId = req.params.id;

        // Ensure mentor has a session with this student (Authorization Check)
        const sessionCount = await Session.countDocuments({
            mentor: req.user.id,
            student: studentId
        });

        if (sessionCount === 0) {
            return res.status(403).json({ message: 'Not authorized to view this student\'s roadmap' });
        }

        // Fetch the student's latest roadmap
        const roadmap = await Roadmap.findOne({ user: studentId }).sort({ generatedAt: -1 });

        if (!roadmap) {
            return res.status(404).json({ message: 'No roadmap found for this student' });
        }

        res.json(roadmap);
    } catch (error) {
        console.error("Failed to fetch student roadmap", error);
        res.status(500).send('Server Error');
    }
};

// @desc    Get or create a student's mentorship record (mentor view)
// @route   GET /api/mentors/students/:id/record
// @access  Private
const getStudentRecord = async (req, res) => {
    try {
        const studentId = req.params.id;

        // Ensure mentor has a session with this student
        const sessionCount = await Session.countDocuments({
            mentor: req.user.id,
            student: studentId
        });

        if (sessionCount === 0) {
            return res.status(403).json({ message: 'Not authorized to view this student\'s record' });
        }

        let record = await MentorRecord.findOne({ mentor: req.user.id, student: studentId });

        if (!record) {
            record = {
                mentor: req.user.id,
                student: studentId,
                notes: [],
                assignments: [],
                resources: []
            };
        }

        res.json(record);
    } catch (error) {
        console.error("Failed to fetch student record", error);
        res.status(500).send('Server Error');
    }
};

// @desc    Add an item to a student's mentorship record
// @route   POST /api/mentors/students/:id/record/:type
// @access  Private
const addRecordItem = async (req, res) => {
    try {
        const studentId = req.params.id;
        const type = req.params.type; // 'notes', 'assignments', 'resources'

        if (!['notes', 'assignments', 'resources'].includes(type)) {
            return res.status(400).json({ message: 'Invalid record type' });
        }

        const sessionCount = await Session.countDocuments({
            mentor: req.user.id,
            student: studentId
        });

        if (sessionCount === 0) {
            return res.status(403).json({ message: 'Not authorized to update this student\'s record' });
        }

        let record = await MentorRecord.findOne({ mentor: req.user.id, student: studentId });
        if (!record) {
            record = await MentorRecord.create({ mentor: req.user.id, student: studentId });
        }

        record[type].unshift(req.body); // Add to the beginning of the array
        await record.save();

        res.json(record);
    } catch (error) {
        console.error(`Failed to add ${req.params.type}`, error);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all mentorship records for a student
// @route   GET /api/mentors/my-mentorships
// @access  Private
const getMyMentorshipRecords = async (req, res) => {
    try {
        const records = await MentorRecord.find({ student: req.user.id })
            .populate('mentor', 'name email avatar')
            .sort({ updatedAt: -1 })
            .lean();

        // 🛡️ Security: Strip `notes` before returning — notes are mentor-private only
        const sanitizedRecords = records.map(r => {
            const { notes, ...publicRecord } = r;
            return publicRecord;
        });

        res.json(sanitizedRecords);
    } catch (error) {
        console.error("Failed to fetch my mentorships", error);
        res.status(500).send('Server Error');
    }
};

// @desc    Update assignment status (student view)
// @route   PUT /api/mentors/assignments/:assignmentId/status
// @access  Private
const updateAssignmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        // Allow BOTH Student and Mentor to locate the record
        const record = await MentorRecord.findOne({
            $or: [{ student: req.user.id }, { mentor: req.user.id }],
            'assignments._id': req.params.assignmentId
        });

        if (!record) {
            return res.status(404).json({ message: 'Assignment or record not found' });
        }

        const assignment = record.assignments.id(req.params.assignmentId);
        
        // Security logic: Only mentors can formally 'complete' it
        if (status === 'completed' && record.mentor.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Only your mentor can approve this assignment.' });
        }
        
        assignment.status = status;
        
        if (status === 'completed') {
            assignment.completedDate = Date.now();
            
            // Gamification Hook
            try {
                await addPoints(record.student, 50, 'Assignment Approved');
                await logActivity(record.student, 'assignment_completed');
            } catch (e) { console.error("Gamification error:", e); }
            
            // Notify Student
            try {
                await Notification.create({
                    recipient: record.student,
                    title: 'Assignment Approved 🎉',
                    message: `Your mentor approved: "${assignment.title}". You earned 50 XP!`,
                    type: 'success',
                    link: '/dashboard'
                });
            } catch (e) {}
        }

        if (status === 'pending_review') {
            // Notify Mentor
            try {
                await Notification.create({
                    recipient: record.mentor,
                    title: 'Assignment Submitted',
                    message: `A student submitted "${assignment.title}" for your review.`,
                    type: 'info',
                    link: '/dashboard' // or mentor specific route
                });
            } catch (e) {}
        }

        await record.save();

        res.json(record);
    } catch (error) {
        console.error("Failed to update assignment status", error);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all reviews/assignments for a mentor
// @route   GET /api/mentors/reviews
// @access  Private (Mentors only)
const getMentorReviews = async (req, res) => {
    try {
        // Find all records where this user is the mentor
        const records = await MentorRecord.find({ mentor: req.user.id })
            .populate('student', 'name email avatar')
            .lean(); // Use lean() for faster processing and easier modification

        let allAssignments = [];

        records.forEach(record => {
            if (record.assignments && record.assignments.length > 0 && record.student) {
                record.assignments.forEach(assignment => {
                    allAssignments.push({
                        ...assignment,
                        studentId: record.student._id,
                        studentName: record.student.name,
                        studentAvatar: record.student.avatar,
                    });
                });
            }
        });

        // Sort assignments by the most recently assigned first
        allAssignments.sort((a, b) => new Date(b.assignDate) - new Date(a.assignDate));

        res.json(allAssignments);
    } catch (error) {
        console.error("Failed to fetch mentor reviews", error);
        res.status(500).send('Server Error');
    }
};

// @desc    Get platform-wide mentor statistics for the student dashboard
// @route   GET /api/mentors/platform-stats
// @access  Private
const getPlatformStats = async (req, res) => {
    try {
        const activeMentors = await User.countDocuments({ isVerifiedMentor: true, isVerified: true });
        const totalSessions = await Session.countDocuments({ status: 'Completed' });
        const yourSessions = await Session.countDocuments({ 
            $or: [{ student: req.user.id }, { mentor: req.user.id }]
        });

        // Mock average rating since a dedicated Review component is beyond the current scope
        const avgRating = "4.8";

        res.json({
            activeMentors,
            totalSessions,
            avgRating,
            yourSessions
        });
    } catch (error) {
        console.error("Failed to fetch platform stats", error);
        res.status(500).send('Server Error');
    }
};

// @desc    Get aggregate stats for mentor dashboard
// @route   GET /api/mentors/stats
// @access  Private (Mentors only)
const getMentorStats = async (req, res) => {
    try {
        const mentorId = req.user.id;

        // 1. Active Students (count distinct students assigned to this mentor via Session)
        const sessions = await Session.find({ mentor: mentorId }).select('student');
        const uniqueStudents = new Set();
        sessions.forEach(s => {
            if (s.student) uniqueStudents.add(s.student.toString());
        });
        const activeStudentsCount = uniqueStudents.size;

        // 2. Pending Reviews (count assignments with status 'pending')
        const records = await MentorRecord.find({ mentor: mentorId });
        let pendingReviewsCount = 0;
        records.forEach(record => {
            if (record.assignments) {
                pendingReviewsCount += record.assignments.filter(a => a.status === 'pending').length;
            }
        });

        // 3. Hours Mentored (sum duration of all 'Completed' sessions)
        const completedSessions = await Session.find({ mentor: mentorId, status: 'Completed' });
        let totalMinutesMentored = 0;
        completedSessions.forEach(session => {
            // Assume session.duration is in minutes; fallback to 60 if not set
            const duration = session.duration || 60;
            totalMinutesMentored += duration;
        });

        // Convert to hours and format nicely, e.g. "48" or "48.5"
        const hoursMentored = (totalMinutesMentored / 60).toFixed(1).replace(/\.0$/, '');

        res.json({
            activeStudents: activeStudentsCount.toString(),
            pendingReviews: pendingReviewsCount.toString(),
            hoursMentored: `${hoursMentored}h`
        });
    } catch (error) {
        console.error("Failed to fetch mentor stats", error);
        res.status(500).send('Server Error');
    }
};

// @desc    Mentor schedules a session directly
// @route   POST /api/mentors/schedule
// @access  Private (Mentors only)
const scheduleSession = async (req, res) => {
    try {
        const { studentId, topic, date, duration, notes } = req.body;

        const session = new Session({
            mentor: req.user.id,
            student: studentId,
            topic,
            date,
            duration: duration || 60,
            status: 'Confirmed',
            notes
        });

        const savedSession = await session.save();

        const notif = await Notification.create({
            recipient: studentId,
            title: 'New Session Scheduled',
            message: `Your mentor has scheduled a new session: ${topic} on ${new Date(date).toLocaleString()}.`,
            type: 'info',
            link: '/dashboard'
        });

        console.log("Mentor scheduled session. Alerted Student:", studentId, "NotifID:", notif._id);

        res.json(savedSession);
    } catch (error) {
        console.error("Failed to schedule session", error);
        res.status(500).send('Server Error');
    }
};

// @desc    Mentor broadcasts a message to all their students
// @route   POST /api/mentors/broadcast
// @access  Private (Mentors only)
const broadcastMessage = async (req, res) => {
    try {
        const { title, message } = req.body;

        // 1. Enforce Broadcast Rate Limiting (24 hours)
        const user = await User.findById(req.user.id);
        if (user.lastBroadcastDate) {
            const ONE_DAY = 24 * 60 * 60 * 1000;
            const timeSinceLastBroadcast = Date.now() - new Date(user.lastBroadcastDate).getTime();
            if (timeSinceLastBroadcast < ONE_DAY) {
                const hoursLeft = Math.ceil((ONE_DAY - timeSinceLastBroadcast) / (60 * 60 * 1000));
                return res.status(429).json({ message: `Broadcast limit reached. Please wait ${hoursLeft} hours.` });
            }
        }

        // Find all sessions where this user is the mentor to get unique students
        const sessions = await Session.find({ mentor: req.user.id }).select('student');

        const uniqueStudents = new Set();
        sessions.forEach(s => {
            if (s.student) uniqueStudents.add(s.student.toString());
        });

        if (uniqueStudents.size === 0) {
            return res.status(400).json({ message: 'No students found to broadcast to.' });
        }

        const notifications = Array.from(uniqueStudents).map(studentId => ({
            recipient: studentId,
            title,
            message,
            type: 'info',
            link: '/dashboard'
        }));

        await Notification.insertMany(notifications);

        // Update the cooldown timer
        user.lastBroadcastDate = Date.now();
        await user.save();

        res.json({ message: `Broadcasted message to ${uniqueStudents.size} students.` });
    } catch (error) {
        console.error("Failed to broadcast message", error);
        res.status(500).send('Server Error');
    }
};

// @desc    Mentor shares a resource quickly from the dashboard
// @route   POST /api/mentors/share-resource
// @access  Private (Mentors only)
const shareResourceQuick = async (req, res) => {
    try {
        const { studentId, title, url, description } = req.body;

        let record = await MentorRecord.findOne({ mentor: req.user.id, student: studentId });

        if (!record) {
            record = await MentorRecord.create({ mentor: req.user.id, student: studentId });
        }

        const newResource = {
            title,
            url,
            description,
            sharedDate: Date.now()
        };

        record.resources.unshift(newResource);
        await record.save();

        await Notification.create({
            recipient: studentId,
            title: 'New Resource Shared',
            message: `Your mentor shared a new resource: ${title}`,
            type: 'info',
            link: '/dashboard'
        });

        res.json(record);
    } catch (error) {
        console.error("Failed to share resource", error);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getAllMentors,
    bookSession,
    getMySessions,
    updateSessionStatus,
    getMyStudents,
    getSingleStudent,
    getStudentRoadmap,
    getStudentRecord,
    addRecordItem,
    getMyMentorshipRecords,
    updateAssignmentStatus,
    getMentorReviews,
    getPlatformStats,
    getMentorStats,
    scheduleSession,
    broadcastMessage,
    shareResourceQuick
};
