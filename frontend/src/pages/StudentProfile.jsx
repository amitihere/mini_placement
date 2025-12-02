import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentProfile = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [tempData, setTempData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStudentData();
    }, []);

    const fetchStudentData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('studentToken');

            if (!token) {
                setError('Please login to access profile');
                return;
            }
            const response = await fetch(`http://localhost:3000/student/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch student data');
            }

            const data = await response.json();
            const student = data.data || data.student; // Handle potential response variations

            setFormData(student);
            setTempData(student);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTempData({ ...tempData, [name]: value });
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('studentToken');
            const response = await fetch(`http://localhost:3000/student/dashboard/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(tempData)
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const data = await response.json();
            setFormData(tempData);
            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (err) {
            alert("Failed to update profile: " + err.message);
        }
    };

    const handleCancel = () => {
        setTempData({ ...formData });
        setIsEditing(false);
    };

    const handleBack = () => {
        navigate(`/student/dashboard`);
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingText}>Loading profile...</div>
            </div>
        );
    }

    if (error || !formData) {
        return (
            <div style={styles.errorContainer}>
                <div style={styles.errorText}>{error || 'Failed to load profile'}</div>
                <button style={styles.retryButton} onClick={fetchStudentData}>
                    Retry
                </button>
            </div>
        );
    }


    return (
        <div className="profile-container">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        :root {
          --bg-color: #0f0f0f;
          --card-bg: #121212;
          --text-main: #ffffff;
          --text-secondary: #a3a3a3;
          --border: #333333;
          --primary: #ffffff;
          --primary-text: #000000;
          --input-bg: #1a1a1a;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Inter', sans-serif;
          background-color: var(--bg-color);
          color: var(--text-main);
          line-height: 1.5;
        }

        .profile-container {
          max-width: 900px;
          margin: 4rem auto;
          padding: 0 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        .back-button {
          background-color: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border);
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.9rem;
          cursor: pointer;
          width: fit-content;
          transition: all 0.2s;
        }

        .back-button:hover {
          color: var(--text-main);
          border-color: var(--text-main);
        }

        .header-section {
          text-align: center;
          padding-bottom: 1rem;
        }

        .student-name {
          font-size: 3.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
          color: var(--text-main);
        }

        .student-college {
          font-size: 1.25rem;
          color: var(--text-secondary);
        }

        .details-section {
          background-color: var(--card-bg);
          border-radius: 12px;
          padding: 2.5rem;
          border: 1px solid var(--border);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
        }

        .section-title {
          font-size: 1.75rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          column-gap: 4rem;
          row-gap: 2.5rem;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
            column-gap: 0;
          }
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .form-label {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .form-value {
          font-size: 1.1rem;
          color: var(--text-main);
          font-weight: 400;
        }

        .form-input {
          background-color: var(--input-bg);
          border: 1px solid var(--border);
          color: var(--text-main);
          padding: 0.75rem 1rem;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s;
          width: 100%;
          font-family: 'Inter', sans-serif;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--text-main);
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          font-size: 0.95rem;
        }

        .btn-primary {
          background-color: var(--primary);
          color: var(--primary-text);
        }

        .btn-primary:hover {
          opacity: 0.9;
        }

        .btn-outline {
          background-color: transparent;
          border: 1px solid var(--border);
          color: var(--text-main);
          margin-right: 0.75rem;
        }

        .btn-outline:hover {
          border-color: var(--text-main);
        }
      `}</style>

            {/* Back Button */}
            <button className="back-button" onClick={handleBack}>
                ← Back to Dashboard
            </button>

            {/* DIV 1: Header (Name & College) */}
            <div className="header-section">
                <h1 className="student-name">{isEditing ? tempData.studentName : formData.studentName}</h1>
                <div className="student-college">
                    {isEditing ? tempData.collegeName : formData.collegeName}
                </div>
            </div>

            {/* DIV 2: Editable Details */}
            <div className="details-section">
                <div className="section-header">
                    <h2 className="section-title">Student Profile</h2>
                    {!isEditing ? (
                        <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                            Edit Details
                        </button>
                    ) : (
                        <div>
                            <button className="btn btn-outline" onClick={handleCancel}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
                        </div>
                    )}
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="studentName"
                                className="form-input"
                                value={tempData.studentName}
                                onChange={handleChange}
                            />
                        ) : (
                            <div className="form-value">{formData.studentName}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        {isEditing ? (
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                value={tempData.email}
                                onChange={handleChange}
                                disabled // Email usually shouldn't be changed easily
                            />
                        ) : (
                            <div className="form-value">{formData.email}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        {isEditing ? (
                            <input
                                type="tel"
                                name="phoneNumber"
                                className="form-input"
                                value={tempData.phoneNumber || ''}
                                onChange={handleChange}
                            />
                        ) : (
                            <div className="form-value">{formData.phoneNumber || 'N/A'}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">College Name</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="collegeName"
                                className="form-input"
                                value={tempData.collegeName || ''}
                                onChange={handleChange}
                            />
                        ) : (
                            <div className="form-value">{formData.collegeName || 'N/A'}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">CGPA</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="cgpa"
                                className="form-input"
                                value={tempData.cgpa || ''}
                                onChange={handleChange}
                            />
                        ) : (
                            <div className="form-value">{formData.cgpa || 'N/A'}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Year of Passing</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="yearOfPassing"
                                className="form-input"
                                value={tempData.yearOfPassing || ''}
                                onChange={handleChange}
                            />
                        ) : (
                            <div className="form-value">{formData.yearOfPassing || 'N/A'}</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

const styles = {
    loadingContainer: {
        minHeight: '100vh',
        backgroundColor: '#0f0f0f',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: '1.25rem',
        color: '#a3a3a3',
    },
    errorContainer: {
        minHeight: '100vh',
        backgroundColor: '#0f0f0f',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
    },
    errorText: {
        fontSize: '1.25rem',
        color: '#ef4444',
    },
    retryButton: {
        backgroundColor: '#ffffff',
        color: '#000000',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '6px',
        fontSize: '0.95rem',
        fontWeight: '600',
        cursor: 'pointer',
    },
};

export default StudentProfile;
