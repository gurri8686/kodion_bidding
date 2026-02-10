const express = require("express");
const {
    getAllUsers, getUserCount, getJobCount, getAppliedJobsCount, getTopTechnologies, getScrapeLogSummary, getUserActivityDetails, toggleUserStatus,userLogs,getPlatforms,getJobStats,getUserJobs
} = require("../controller/adminController");


const authenticate = require("../middleware/middleware");
const router = express.Router();
router.get('/allusers', authenticate, getAllUsers);
router.get('/allusers-count', authenticate, getUserCount);
router.get('/job-count', authenticate, getJobCount);    
router.get('/appliedjob-count', authenticate, getAppliedJobsCount);
router.get('/top-tech', authenticate, getTopTechnologies);
router.get('/get-scrape-log-summary', authenticate, getScrapeLogSummary);
router.get("/user/activity", authenticate, getUserActivityDetails);
router.put("/user/:id/status", authenticate, toggleUserStatus);
router.get('/logs/:id', authenticate, userLogs);
router.get('/platforms', authenticate, getPlatforms);
router.get('/job-stats', authenticate, getJobStats);
router.get('/user/:userId/jobs', authenticate, getUserJobs);
module.exports = router;