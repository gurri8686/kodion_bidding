const express = require("express");
const {
  saveJob,
  getJobs,
  getScrapelogs,
} = require("../controller/jobController");

const {
  ignoreJob,
  getIgnoredJobs
} = require("../controller/ignoredJobs");

const {
  applyToJob,
  getAppliedJobs,
  editAppliedJob,
  updateStage
} = require("../controller/applyJobController");

const { markHiredJob,getHiredJobs } = require("../controller/hireJobController");
const {
  ActivateTechnology,
  deactivateTechnology,
  gettechnologiesByUserId,
  getAllActiveTechnologies,
  getAllTechnologyNames
} = require("../controller/technologyController");
const authenticate = require("../middleware/middleware");
const upload = require("../config/multer");

const router = express.Router();

// Existing routes
router.post("/add", saveJob);
router.get("/get-jobs", getJobs);
router.post("/ignore", authenticate, ignoreJob);
router.get("/get-ignored-jobs", authenticate, getIgnoredJobs);
router.get("/applied-jobs/:userId", authenticate, getAppliedJobs); // Get applied jobs for a user

router.post("/apply-job", authenticate, upload.array("attachments", 5), applyToJob);
router.put("/update-stage/:id", authenticate, updateStage); // Update stage of applied job
router.get("/scrape-logs", authenticate, getScrapelogs); // Get applied jobs
router.put('/edit-apply-job/:jobId', authenticate, upload.array("attachments", 5), editAppliedJob); // Get applied job details for editing
//  for a user
router.post('/activate', authenticate, ActivateTechnology);
router.post('/deactivate', authenticate, deactivateTechnology);
router.get('/active/:userId', authenticate, gettechnologiesByUserId);
router.get('/all-active', getAllActiveTechnologies);
router.get('/all-technology-names', getAllTechnologyNames);
router.post("/mark-hired", authenticate, markHiredJob);
router.get("/get-hired-jobs/:bidderId", authenticate, getHiredJobs);

// Serve uploaded attachments
router.use('/attachments', express.static(require('path').join(__dirname, '../uploads/attachments')));

module.exports = router;
