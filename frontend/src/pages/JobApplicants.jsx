import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const JobApplicants = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchApplicants();
    }, [jobId]);

    const fetchApplicants = async () => {
        try {
            const token = localStorage.getItem('companyToken');
            const response = await fetch(`http://localhost:3000/company/jobs/appliedStudents?jobId=${jobId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch applicants');
            }

            const data = await response.json();
            setApplicants(data.data || []);
            setLoading(false);
        } catch (err) {
            console.error("Fetch Applicants Error:", err);
            setError(err.message);
            setLoading(false);
        }
    };

    const updateStatus = async (applicationId, newStatus) => {
        try {
            const token = localStorage.getItem('companyToken');
            const response = await fetch(`http://localhost:3000/company/jobs/application/${applicationId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            // Update local state
            setApplicants(prev => prev.map(app =>
                app.applicationId === applicationId ? { ...app, status: newStatus } : app
            ));

        } catch (err) {
            console.error("Update Status Error:", err);
            alert("Failed to update status");
        }
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingText}>Loading applicants...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.errorContainer}>
                <div style={styles.errorText}>{error}</div>
                <button style={styles.retryButton} onClick={() => navigate(-1)}>Go Back</button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button style={styles.backButton} onClick={() => navigate('/company/dashboard')}>
                    ← Back to Dashboard
                </button>
                <h1 style={styles.title}>Job Applicants</h1>
            </div>

            <div style={styles.content}>
                {applicants.length === 0 ? (
                    <div style={styles.emptyState}>
                        <p style={styles.emptyStateText}>No applicants yet</p>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {applicants.map((app) => (
                            <div key={app.applicationId} style={styles.card}>
                                <div style={styles.cardHeader}>
                                    <h3 style={styles.studentName}>{app.student.studentName}</h3>
                                    <div style={styles.statusContainer}>
                                        <span style={{
                                            ...styles.statusBadge,
                                            backgroundColor: app.status === 'Shortlisted' ? 'rgba(34, 197, 94, 0.1)' :
                                                app.status === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' :
                                                    'rgba(59, 130, 246, 0.1)',
                                            color: app.status === 'Shortlisted' ? '#4ade80' :
                                                app.status === 'Rejected' ? '#f87171' :
                                                    '#60a5fa',
                                            borderColor: app.status === 'Shortlisted' ? 'rgba(34, 197, 94, 0.2)' :
                                                app.status === 'Rejected' ? 'rgba(239, 68, 68, 0.2)' :
                                                    'rgba(59, 130, 246, 0.2)',
                                        }}>{app.status}</span>
                                    </div>
                                </div>

                                <div style={styles.cardBody}>
                                    <div style={styles.infoRow}>
                                        <span style={styles.label}>Email:</span>
                                        <span style={styles.value}>{app.student.email}</span>
                                    </div>
                                    <div style={styles.infoRow}>
                                        <span style={styles.label}>Phone:</span>
                                        <span style={styles.value}>{app.student.phoneNumber || 'N/A'}</span>
                                    </div>
                                    <div style={styles.infoRow}>
                                        <span style={styles.label}>College:</span>
                                        <span style={styles.value}>{app.student.college || 'N/A'}</span>
                                    </div>
                                    <div style={styles.infoRow}>
                                        <span style={styles.label}>Applied:</span>
                                        <span style={styles.value}>{new Date(app.appliedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div style={styles.actionButtons}>
                                    {app.status === 'Applied' && (
                                        <>
                                            <button
                                                style={styles.rejectButton}
                                                onClick={() => updateStatus(app.applicationId, 'Rejected')}
                                                title="Reject"
                                            >
                                                ✕
                                            </button>
                                            <button
                                                style={styles.shortlistButton}
                                                onClick={() => updateStatus(app.applicationId, 'Shortlisted')}
                                                title="Shortlist"
                                            >
                                                ✓
                                            </button>
                                        </>
                                    )}
                                    {app.student.resume_link && (
                                        <a
                                            href={app.student.resume_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={styles.resumeButton}
                                        >
                                            View Resume
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#0f0f0f',
        color: '#ffffff',
        fontFamily: "'Inter', sans-serif",
        padding: '2rem',
    },
    header: {
        maxWidth: '1200px',
        margin: '0 auto 2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
    },
    backButton: {
        background: 'transparent',
        border: '1px solid #333333',
        color: '#a3a3a3',
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        transition: 'all 0.2s',
    },
    title: {
        fontSize: '2rem',
        fontWeight: '700',
        color: '#ffffff',
    },
    content: {
        maxWidth: '1200px',
        margin: '0 auto',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem',
    },
    card: {
        backgroundColor: '#1a1a1a',
        border: '1px solid #333333',
        borderRadius: '12px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'start',
        marginBottom: '0.5rem',
    },
    studentName: {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#ffffff',
        margin: 0,
    },
    statusBadge: {
        fontSize: '0.8rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        border: '1px solid',
        fontWeight: '500',
    },
    statusContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    actionButtons: {
        display: 'flex',
        gap: '0.5rem',
        marginTop: 'auto',
        paddingTop: '1rem',
    },
    rejectButton: {
        flex: 1,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        color: '#ef4444',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        padding: '0.75rem',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '1.1rem',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    shortlistButton: {
        flex: 1,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        color: '#22c55e',
        border: '1px solid rgba(34, 197, 94, 0.2)',
        padding: '0.75rem',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '1.1rem',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardBody: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        marginBottom: '1rem',
    },
    infoRow: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    },
    label: {
        fontSize: '0.85rem',
        color: '#a3a3a3',
    },
    value: {
        fontSize: '0.95rem',
        color: '#e5e5e5',
    },
    resumeButton: {
        marginTop: 'auto',
        textAlign: 'center',
        backgroundColor: '#ffffff',
        color: '#000000',
        padding: '0.75rem',
        borderRadius: '6px',
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '0.9rem',
        transition: 'opacity 0.2s',
    },
    loadingContainer: {
        minHeight: '100vh',
        backgroundColor: '#0f0f0f',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#ffffff',
        fontSize: '1.2rem',
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
        color: '#ef4444',
        fontSize: '1.2rem',
    },
    retryButton: {
        backgroundColor: '#ffffff',
        color: '#000000',
        border: 'none',
        padding: '0.5rem 1.5rem',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '600',
    },
    emptyState: {
        textAlign: 'center',
        padding: '4rem',
        backgroundColor: '#1a1a1a',
        borderRadius: '12px',
        border: '1px solid #333333',
    },
    emptyStateText: {
        color: '#a3a3a3',
        fontSize: '1.1rem',
    }
};

export default JobApplicants;
