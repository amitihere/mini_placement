const { createJobIfNotExists, getStudentJobsData } = require("../services.js");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createJobs = async (req, res) => {
    try {
        const email = req.companyEmail
        const company = await prisma.companies.findFirst({
            where: { email: email }
        });
        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }
        const companyId = company.companyId;
        const jobData = {
            ...req.body,
            companyId: companyId
        };

        const created = await createJobIfNotExists(jobData);

        return res.status(201).json({
            message: "Job Created Successfully",
            data: created
        });
    } catch (err) {

        console.error("Create Job Error:", err);
        return res.status(500).json({
            message: "Something is wrong",
            error: err.message
        });
    }
}
const getJobs = async (req, res) => {

    try {
        const email = req.companyEmail
        const company = await prisma.companies.findFirst({
            where: { email: email }
        });
        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }
        const companyId = company.companyId;
        const jobs = await prisma.jobs.findMany({
            where: { companyId: companyId }
        });
        return res.status(200).json({
            message: "Jobs fetched Successfully",
            data: jobs
        })
    } catch (err) {
        return res.status(404).json({ message: "Something is wrong", error: err })
    }
}

const getJobById = async (req, res) => {
    const job_id = Number(req.params.id);
    const companyEmail = req.companyEmail;

    const company = await prisma.companies.findFirst({
        where: { email: companyEmail }
    });
    if (!company) {
        return res.status(404).json({ message: "Company not found" });
    }
    const companyId = company.companyId;
    const job = await prisma.jobs.findFirst({
        where: { jobId: job_id, companyId: companyId },
        include: {
            skills: {
                select: { skillName: true }
            }
        }
    });
    console.log("Fetched Job:", job);
    return res.status(200).json({ message: "Job fetched Successfully", data: job })
}

const updateJob = async (req, res) => {
    const job_id = Number(req.params.id);
    const updateData = req.body;
    const companyEmail = req.companyEmail;
    console.log("Update Data:", updateData);

    const company = await prisma.companies.findFirst({
        where: { email: companyEmail }
    });
    if (!company) {
        return res.status(404).json({ message: "Company not found" });
    }
    const companyId = company.companyId;
    const updatedJob = await prisma.jobs.update({
        where: { jobId: job_id, companyId: companyId },
        data: {
            jobTitle: updateData.jobTitle,
            isActive: true,
            stipend: updateData.stipend,
            description: updateData.description,
            skills: {
                connectOrCreate: updateData.skills.map(skill => ({
                    where: { skillName: skill },
                    create: { skillName: skill }
                }))
            }
        },
        include: { skills: true }
    });
    return res.status(200).json({ message: "Successfully updated", data: updatedJob })
}

const deleteJob = async (req, res) => {
    try {
        const job_id = Number(req.params.id);
        const companyEmail = req.companyEmail;

        const company = await prisma.companies.findFirst({
            where: { email: companyEmail }
        });

        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        // Step 1: Delete related applications
        await prisma.applications.deleteMany({
            where: { jobId: job_id }
        });

        // Step 2: Delete job
        await prisma.jobs.delete({
            where: { jobId: job_id }
        });

        return res.status(200).json({ message: "Job Deleted Successfully" });

    } catch (err) {
        console.log("Error deleting job:", err);
        return res.status(500).json({ message: "Could not delete job", error: err });
    }
};


const getNumberOfStudentsApplied = async (req, res) => {
    const companyEmail = req.companyEmail
    const { jobId } = req.query;
    try {
        const studentsApplied = await getStudentJobsData(companyEmail, jobId);

        const applications = studentsApplied.Applications.map((app) => ({
            ...app,
            student: {
                ...app.student,
                phoneNumber: app.student.phoneNumber?.toString()  // BIGINT → string
            }
        }));

        return res.status(200).json({
            message: "Successfully got the information",
            data: applications,
            count: applications.length
        });
    } catch (err) {
        return res.status(404).json({ message: "Could not get the data required", error: err })
    }


const updateApplicationStatus = async (req, res) => {
    try {
        const applicationId = Number(req.params.applicationId);
        const { status } = req.body;
        const companyEmail = req.companyEmail;

        if (!['Shortlisted', 'Rejected', 'Applied'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        // Verify company owns the job associated with this application
        const company = await prisma.companies.findFirst({
            where: { email: companyEmail }
        });

        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        const application = await prisma.applications.findUnique({
            where: { applicationId: applicationId },
            include: { job: true }
        });

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        if (application.job.companyId !== company.companyId) {
            return res.status(403).json({ message: "Unauthorized to update this application" });
        }

        const updatedApplication = await prisma.applications.update({
            where: { applicationId: applicationId },
            data: { status: status }
        });

        return res.status(200).json({
            message: "Application status updated successfully",
            data: updatedApplication
        });

    } catch (err) {
        console.error("Update Application Status Error:", err);
        return res.status(500).json({ message: "Could not update status", error: err.message });
    }
}

module.exports = { createJobs, getJobs, updateJob, deleteJob, getJobById, getNumberOfStudentsApplied, updateApplicationStatus };
