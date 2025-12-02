const express = require("express");
const { postCompany, companylogin, companydashboard, updateCompanyProfile } = require("./controller.js");
const { authMiddleware } = require("./middleware/authentication.js");
const { verifyCompanydetails } = require("./middleware/middleware.js");
const { createJobs, getJobs, updateJob, deleteJob, getJobById, getNumberOfStudentsApplied, updateApplicationStatus } = require('./controllers/handleJobs.js');
const router = require("../student/routes/catalog.js");

const router1 = express.Router();

router1.post("/signup", verifyCompanydetails, postCompany);
router1.post("/login", companylogin);
router1.put("/profile", authMiddleware, updateCompanyProfile);
router1.get("/dashboard", authMiddleware, companydashboard);
router1.post("/dashboard/job", authMiddleware, createJobs);
router1.get("/dashboard/job", authMiddleware, getJobs);
router1.put("/dashboard/job/:id", authMiddleware, updateJob);
router1.delete("/dashboard/job/:id", authMiddleware, deleteJob);
router1.get("/dashboard/job/:id", authMiddleware, getJobById);
router1.get("/jobs/appliedStudents", authMiddleware, getNumberOfStudentsApplied);
router1.put("/jobs/application/:applicationId/status", authMiddleware, updateApplicationStatus);
module.exports = router1;