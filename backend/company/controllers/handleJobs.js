const { createJobIfNotExists } = require("../services.js");
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

    try{
        const email = req.companyEmail
        const company = await prisma.companies.findFirst({
            where: { email: email }
        });
        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }
        const companyId = company.companyId;
        const jobs = await prisma.jobs.findMany({
            where: {companyId:companyId}
        });
        return res.status(200).json({
            message:"Jobs fetched Successfully",
            data: jobs
        })
    }catch(err){
        return res.status(404).json({message:"Something is wrong",error:err})
    }
}

const getJobById = async (req,res) => {
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
        where: { jobId: job_id,companyId:companyId },
        include : { skills: {
      select: { skillName: true }
    }}
    });
    console.log("Fetched Job:", job);
    return res.status(200).json({message:"Job fetched Successfully",data : job})
}

const updateJob = async (req,res) => {
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
        where: { jobId: job_id,companyId:companyId },
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
    return res.status(200).json({message:"Successfully updated",data : updatedJob})
}

const deleteJob = async (req,res) => {
    const job_id = Number(req.params.id);
    const companyEmail = req.companyEmail;

    const company = await prisma.companies.findFirst({
        where: { email: companyEmail }
    });
    if (!company) {
        return res.status(404).json({ message: "Company not found" });
    }
    const companyId = company.companyId;
    await prisma.jobs.delete({
        where: { jobId: job_id ,companyId:companyId},
    });
    return res.status(200).json({message:"Job Deleted Successfully"})
}


module.exports = {createJobs,getJobs,updateJob,deleteJob,getJobById};