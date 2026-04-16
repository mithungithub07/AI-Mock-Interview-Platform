import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadPDF, sendInterviewLink } from '../services/api';
import '../style/admin.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    // Upload PDF state
    const [selectedRole, setSelectedRole] = useState('java');
    const [pdfFile, setPdfFile] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');

    // Send link state
    const [linkRole, setLinkRole] = useState('java');
    const [linkLevel, setLinkLevel] = useState('fresher');
    const [candidateEmail, setCandidateEmail] = useState('');
    const [linkLoading, setLinkLoading] = useState(false);
    const [linkMessage, setLinkMessage] = useState('');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handlePdfFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (file.type !== 'application/pdf') {
                setUploadMessage('❌ Please select a valid PDF file');
                setPdfFile(null);
                e.target.value = ''; // Clear the input
                return;
            }
            setPdfFile(file);
            setUploadMessage(''); // Clear any previous messages
        }
    };

    const handleUploadPDF = async (e) => {
        e.preventDefault();

        if (!pdfFile) {
            setUploadMessage('❌ Please select a PDF file');
            return;
        }

        setUploadLoading(true);
        setUploadMessage('');

        try {
            const data = await uploadPDF(selectedRole, pdfFile);
            setUploadMessage(`✅ ${data.message} - ${data.questions_extracted} questions extracted`);
            setPdfFile(null);
            e.target.reset();
        } catch (err) {
            setUploadMessage('❌ Upload failed. Please try again.');
        } finally {
            setUploadLoading(false);
        }
    };

    const handleSendLink = async (e) => {
        e.preventDefault();

        if (!candidateEmail) {
            setLinkMessage('❌ Please enter candidate email');
            return;
        }

        setLinkLoading(true);
        setLinkMessage('');

        try {
            const data = await sendInterviewLink({
                email: candidateEmail,
                role: linkRole,
                level: linkLevel
            });
            setLinkMessage(`✅ Interview link sent to ${candidateEmail}`);
            setCandidateEmail('');
        } catch (err) {
            setLinkMessage('❌ Failed to send link. Please try again.');
        } finally {
            setLinkLoading(false);
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p className="admin-welcome">Welcome, {user?.name}</p>
                </div>
                <div className="header-buttons">
                    <button onClick={() => navigate('/')} className="home-btn">🏠 Home</button>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </div>

            <div className="admin-content">

                {/* Upload PDF Section */}
                <div className="admin-section">
                    <h2>📄 Upload Question PDF</h2>
                    <form onSubmit={handleUploadPDF}>
                        <div className="form-group">
                            <label>Select Role</label>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                            >
                                <option value="java">Java Developer</option>
                                <option value="python">Python Developer</option>
                                <option value="react">React Developer</option>
                                <option value="fullstack">Full Stack Developer</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Upload PDF</label>
                            <input
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={handlePdfFileChange}
                                disabled={uploadLoading}
                            />
                            {pdfFile && (
                                <p style={{ marginTop: '8px', color: '#4ade80', fontSize: '14px' }}>
                                    ✓ Selected: {pdfFile.name}
                                </p>
                            )}
                        </div>

                        <button type="submit" disabled={uploadLoading || !pdfFile}>
                            {uploadLoading ? 'Uploading...' : 'Upload & Extract Questions'}
                        </button>
                    </form>

                    {uploadMessage && (
                        <div className={uploadMessage.includes('✅') ? 'success-message' : 'error-message'}>
                            {uploadMessage}
                        </div>
                    )}
                </div>

                {/* Send Interview Link Section */}
                <div className="admin-section">
                    <h2>✉️ Send Interview Link</h2>
                    <form onSubmit={handleSendLink}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Role</label>
                                <select
                                    value={linkRole}
                                    onChange={(e) => setLinkRole(e.target.value)}
                                >
                                    <option value="java">Java Developer</option>
                                    <option value="python">Python Developer</option>
                                    <option value="react">React Developer</option>
                                    <option value="fullstack">Full Stack Developer</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Level</label>
                                <select
                                    value={linkLevel}
                                    onChange={(e) => setLinkLevel(e.target.value)}
                                >
                                    <option value="fresher">Fresher</option>
                                    <option value="junior">Junior</option>
                                    <option value="senior">Senior</option>
                                    <option value="architect">Architect</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Candidate Email</label>
                            <input
                                type="email"
                                value={candidateEmail}
                                onChange={(e) => setCandidateEmail(e.target.value)}
                                placeholder="candidate@email.com"
                                required
                            />
                        </div>

                        <button type="submit" disabled={linkLoading}>
                            {linkLoading ? 'Sending...' : 'Send Interview Link'}
                        </button>
                    </form>

                    {linkMessage && (
                        <div className={linkMessage.includes('✅') ? 'success-message' : 'error-message'}>
                            {linkMessage}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;