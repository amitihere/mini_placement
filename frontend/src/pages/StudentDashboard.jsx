import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/styles/global.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [alreadyApplied, setAlreadyApplied] = useState([]); // ⬅ NEW
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('studentToken');
      if (!token) {
        setError('Please login to access dashboard');
        setLoading(false);
        return;
      }

      // Fetch student profile
      const profileResponse = await fetch(`http://localhost:3000/student/dashboard`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const profileData = await profileResponse.json();

      // Fetch available jobs
      const jobsResponse = await fetch(`http://localhost:3000/student/dashboard/jobsStudent`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const jobsData = await jobsResponse.json();
      const jobsList = Array.isArray(jobsData.data) ? jobsData.data : [];

      // Fetch applied jobs (NEW)
      const appliedRes = await fetch(`http://localhost:3000/student/jobsApplied`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const appliedData = await appliedRes.json();
      setAlreadyApplied(appliedData.data || []); // → [{ jobId, status }, { jobId, status }]

      setStudentData(profileData.data);
      setJobs(jobsList);
      setLoading(false);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const getApplicationStatus = (jobId) => {
    const application = alreadyApplied.find(a => a.jobId === jobId);
    return application ? application.status : null;
  };

  const hasAlreadyApplied = (jobId) => !!getApplicationStatus(jobId);

  const handleProfileClick = () => navigate(`/student/profile`);

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    navigate('/');
  };

  const handleApply = async (jobId) => {
    if (hasAlreadyApplied(jobId)) {
      alert("You already applied to this job.");
      return;
    }

    try {
      setApplying(jobId);
      const token = localStorage.getItem('studentToken');

      const res = await fetch('http://localhost:3000/student/apply', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      });

      const response = await res.json();
      if (res.ok) {
        alert("Applied successfully!");
        setAlreadyApplied(prev => [...prev, { jobId, status: 'Applied' }]); // instant UI update
      } else {
        alert(response.message || 'Failed to apply');
      }
    } catch (err) {
      console.error("Apply Error:", err);
      alert('Error applying to job');
    } finally {
      setApplying(null);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorText}>{error}</div>
        <button style={styles.retryButton} onClick={fetchDashboardData}>Retry</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>PlacementHub</div>
        <button style={{ ...styles.profileButton, marginLeft: 'auto',marginRight: '8px',backgroundColor:'#f6f3f3ff',transition: 'opacity 0.2s' }} onClick={handleLogout}>Log Out</button>
        <button style={styles.profileButton} onClick={handleProfileClick}>Student Profile</button>
      </div>

      {/* Welcome */}
      <div style={styles.welcomeSection}>
        <h1 style={styles.welcomeTitle}>Welcome, {studentData?.studentName}!</h1>
        <p style={styles.welcomeSubtitle}>Find and apply to your dream jobs</p>
      </div>

      {/* Main Content */}
      <div style={styles.content}>

        {/* Jobs List */}
        <div style={styles.jobsSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Available Jobs</h2>
          </div>

          <div style={styles.jobsList}>
            {jobs.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyStateText}>No jobs available at the moment</p>
              </div>
            ) : (
              jobs.map(job => (
                <div key={job.jobId} style={styles.jobCard}>
                  <div
                    style={{ ...styles.jobInfo, cursor: 'pointer' }}
                    onClick={() => navigate(`/student/job/${job.jobId}`)}
                  >
                    <h3 style={styles.jobTitle}>{job.jobTitle || 'Untitled Job'}</h3>

                    <div style={styles.jobMeta}>
                      <span style={styles.jobMetaItem}>{job.companyName || 'Company'}</span>
                      <span style={styles.jobDivider}>•</span>
                      <span style={styles.jobMetaItem}>{job.location || 'Remote'}</span>
                      {job.stipend && (
                        <>
                          <span style={styles.jobDivider}>•</span>
                          <span style={styles.jobMetaItem}>{job.stipend}</span>
                        </>
                      )}
                    </div>

                    {job.description && (
                      <p style={styles.jobDescription}>
                        {job.description.substring(0, 150)}
                        {job.description.length > 150 ? '...' : ''}
                      </p>
                    )}

                    {job.Skills && job.Skills.length > 0 && (
                      <div style={styles.skillsContainer}>
                        {job.Skills.map((skill, idx) => (
                          <span key={idx} style={styles.skillTag}>{skill}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 🔥 Updated Apply Button */}
                  <button
                    style={{
                      ...styles.applyButton,
                      backgroundColor: hasAlreadyApplied(job.jobId) ?
                        (getApplicationStatus(job.jobId) === 'Shortlisted' ? '#22c55e' :
                          getApplicationStatus(job.jobId) === 'Rejected' ? '#ef4444' :
                            '#555555')
                        : '#ffffff',
                      color: hasAlreadyApplied(job.jobId) ? '#ffffff' : '#000000',
                      cursor: hasAlreadyApplied(job.jobId) ? 'default' : 'pointer',
                      opacity: hasAlreadyApplied(job.jobId) ? 0.9 : 1
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApply(job.jobId);
                    }}
                    disabled={hasAlreadyApplied(job.jobId) || applying === job.jobId}
                  >
                    {hasAlreadyApplied(job.jobId)
                      ? getApplicationStatus(job.jobId)
                      : applying === job.jobId
                        ? "Applying..."
                        : "Apply"}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Profile Card */}
        <div style={styles.infoCard}>
          <h3 style={styles.infoTitle}>Your Profile</h3>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}><span style={styles.infoLabel}>Email</span><span style={styles.infoValue}>{studentData?.email}</span></div>
            <div style={styles.infoItem}><span style={styles.infoLabel}>Phone</span><span style={styles.infoValue}>{studentData?.phoneNumber}</span></div>
            <div style={styles.infoItem}><span style={styles.infoLabel}>College</span><span style={styles.infoValue}>{studentData?.collegeName}</span></div>
            <div style={styles.infoItem}><span style={styles.infoLabel}>CGPA</span><span style={styles.infoValue}>{studentData?.cgpa}</span></div>
          </div>
        </div>

      </div>
    </div>
  );
};

// (Your same styles object unchanged)

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f0f0f',
    color: '#ffffff',
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '1.5rem 3rem',
    borderBottom: '1px solid #333333',
    justifyContent: 'flex-start',
},
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  profileButton: {
    backgroundColor: '#ffffff',
    color: '#000000',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
},
  welcomeSection: {
    padding: '4rem 3rem 2rem',
    textAlign: 'center',
  },
  welcomeTitle: {
    fontSize: '3rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    letterSpacing: '-0.02em',
  },
  welcomeSubtitle: {
    fontSize: '1.25rem',
    color: '#a3a3a3',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 3rem',
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '2rem',
  },
  jobsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: '1.75rem',
    fontWeight: '600',
  },
  jobsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  jobCard: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333333',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    transition: 'border-color 0.2s',
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#ffffff',
  },
  jobMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
    flexWrap: 'wrap',
  },
  jobMetaItem: {
    fontSize: '0.9rem',
    color: '#a3a3a3',
  },
  jobDivider: {
    color: '#666666',
  },
  jobDescription: {
    fontSize: '0.95rem',
    color: '#cccccc',
    lineHeight: '1.5',
    marginBottom: '1rem',
  },
  skillsContainer: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: '#333333',
    color: '#ffffff',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
  },
  applyButton: {
    backgroundColor: '#ffffff',
    color: '#000000',
    border: 'none',
    padding: '0.5rem 1.5rem',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginLeft: '1rem',
    whiteSpace: 'nowrap',
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333333',
    borderRadius: '12px',
    padding: '1.5rem',
    height: 'fit-content',
  },
  infoTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  infoLabel: {
    fontSize: '0.85rem',
    color: '#a3a3a3',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: '1rem',
    color: '#ffffff',
  },
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
  emptyState: {
    textAlign: 'center',
    padding: '2rem',
    color: '#a3a3a3',
  },
  emptyStateText: {
    fontSize: '1.1rem',
  }
};

export default StudentDashboard;
