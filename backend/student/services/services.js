const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt')
const prisma = new PrismaClient();
const salt = 10

const createStudentSignup = async (studentData) => {
    console.log("Entered services page")

    const phoneAsBigInt = BigInt(studentData.phoneNumber);

    const alreadyExists = await prisma.students.findFirst({
        where: {
            OR: [
                { email: studentData.email },
                { phoneNumber: phoneAsBigInt }
            ]
        }
    })
    if (alreadyExists) {
        throw new Error("Student with given email or phone number already exists");
    }
    const hashedPass = await bcrypt.hash(studentData.password, salt)

    const created = await prisma.students.create({
        data: {
            ...studentData,
            phoneNumber: phoneAsBigInt,
            password: hashedPass
        }
    })
    return created


}

const checkStudentLogin = async (studentData) => {
    console.log("Entered check student login service")

    const checkLogin = await prisma.students.findFirst({
        where: { email: studentData.email }
    })

    if (!checkLogin) {
        throw new Error("Student with the credentials not found")
    }
    const comparedPass = await bcrypt.compare(studentData.password, checkLogin.password)

    if (!comparedPass) {
        throw new Error("student has entered incorrect password")
    }

    return checkLogin

}

const studentInformation = async (studentEmail) => {
    console.log("entered services of dashboard")
    const studentInfo = await prisma.students.findUnique({
        where: {
            email: studentEmail
        }
    })

    return studentInfo
}

const fetchJobsForStudent = async (studentEmail) => {
    const job = await prisma.jobs.findMany({
        where: {
            isActive: true
        }
    })
    return job
}
const applicationToJob = async (studentEmail, jobId) => {
    const student = await prisma.students.findFirst({
        where: {
            email: studentEmail
        }
    });
    if (!student) {
        throw new Error("Student not found");
    }
    const existingApplication = await prisma.applications.findFirst({
        where: {
            studentId: student.student_id,
            jobId: jobId
        }
    })
    if (existingApplication) {
        throw new Error("Already applied to the job before")
    }
    const applied = await prisma.applications.create({
        data: {
            studentId: student.student_id,
            jobId: jobId
        }
    })
    return applied
}

const studentUpdated = async (studentEmail, updateData) => {
    const { student_id, email, ...dataToUpdate } = updateData;

    if (dataToUpdate.phoneNumber) {
        dataToUpdate.phoneNumber = BigInt(dataToUpdate.phoneNumber);
    }

    const info = await prisma.students.update({
        where: { email: studentEmail },
        data: dataToUpdate
    })
    return info
}

const fetchAppliedJobs = async (studentEmail) => {
    console.log("Entered fetch applied jobs service", studentEmail)
    const appliedStudents = await prisma.students.findFirst({
        where: {
            email: studentEmail
        }
    })
    const application = await prisma.applications.findMany({
        where: {
            studentId: appliedStudents.student_id
        },
        select: {
            jobId: true,
            status: true
        }
    })
    console.log("Applied jobs fetched:", application)
    return application
}
module.exports = { createStudentSignup, checkStudentLogin, studentInformation, fetchJobsForStudent, applicationToJob, studentUpdated, fetchAppliedJobs }