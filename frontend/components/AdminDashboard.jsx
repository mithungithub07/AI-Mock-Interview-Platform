import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadPDF, sendInterviewLink, updateQuestions } from '../services/api';
import '../style/admin.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    // Upload PDF state
    const [selectedRole, setSelectedRole] = useState('java');
    const [selectedLevel, setSelectedLevel] = useState('fresher');
    const [pdfFile, setPdfFile] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');
    const [extractedQuestions, setExtractedQuestions] = useState([]);
    const [showPreview, setShowPreview] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    // Send link state
    const [linkRole, setLinkRole] = useState('java');
    const [linkLevel, setLinkLevel] = useState('fresher');
    const [candidateEmail, setCandidateEmail] = useState('');
    const [linkLoading, setLinkLoading] = useState(false);
    const [linkMessage, setLinkMessage] = useState('');

    const roles = [
        { value: 'java', label: 'Java Developer' },
        { value: 'python', label: 'Python Developer' },
        { value: 'react', label: 'React Developer' },
        { value: 'fullstack', label: 'Full Stack Developer' }
    ];

    const levels = [
        { value: 'fresher', label: '🌱 Fresher (0–1 yrs)' },
        { value: 'junior', label: '💼 Junior (1–3 yrs)' },
        { value: 'senior', label: '⭐ Senior (3–8 yrs)' },
        { value: 'architect', label: '🏛 Architect (8+ yrs)' }
    ];

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handlePdfFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                setUploadMessage('❌ Please select a valid PDF file');
                setPdfFile(null);
                e.target.value = '';
                return;
            }
            setPdfFile(file);
            setUploadMessage('');
            setExtractedQuestions([]);
            setShowPreview(false);
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
            const data = await uploadPDF(selectedRole, selectedLevel, pdfFile);

            console.log("UPLOAD RESPONSE:", data);

            if (data.questions_extracted > 0) {
                setUploadMessage(`✅ ${data.questions_extracted} questions uploaded to ${selectedRole} - ${selectedLevel}`);
            } else {
                setUploadMessage(`⚠️ No questions extracted`);
            }

            setPdfFile(null);
            e.target.reset();

        } catch (err) {
            setUploadMessage(`❌ Upload failed: ${err.response?.data?.detail || err.message}`);
            console.error('Upload error:', err);
        } finally {
            setUploadLoading(false);
        }

        const handleConfirmQuestions = async () => {
            if (extractedQuestions.length === 0) {
                setUploadMessage('❌ No questions to save');
                return;
            }

            setConfirmLoading(true);
            setUploadMessage('');

            try {
                const data = await updateQuestions({
                    role: selectedRole,
                    level: selectedLevel,
                    questions: extractedQuestions
                });

                setUploadMessage(`✅ ${extractedQuestions.length} questions saved to ${selectedRole} - ${selectedLevel}`);
                setShowPreview(false);
                setExtractedQuestions([]);
            } catch (err) {
                setUploadMessage('❌ Failed to save questions. Please try again.');
                console.error(err);
            } finally {
                setConfirmLoading(false);
            }
        };

        const handleCancelPreview = () => {
            setShowPreview(false);
            setExtractedQuestions([]);
            setUploadMessage('');
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
                console.error(err);
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
                        {!showPreview ? (
                            <form onSubmit={handleUploadPDF}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Select Role</label>
                                        <select
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value)}
                                        >
                                            {roles.map(role => (
                                                <option key={role.value} value={role.value}>
                                                    {role.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Select Level</label>
                                        <select
                                            value={selectedLevel}
                                            onChange={(e) => setSelectedLevel(e.target.value)}
                                        >
                                            {levels.map(level => (
                                                <option key={level.value} value={level.value}>
                                                    {level.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
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
                        ) : (
                            <div className="preview-section">
                                <h3>Preview Questions - {selectedRole.toUpperCase()} ({selectedLevel})</h3>
                                <div className="questions-list">
                                    {extractedQuestions.map((question, index) => (
                                        <div key={index} className="question-item">
                                            <strong>Q{index + 1}:</strong> {question}
                                        </div>
                                    ))}
                                </div>
                                <div className="preview-actions">
                                    <button
                                        onClick={handleCancelPreview}
                                        className="btn-cancel"
                                        disabled={confirmLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmQuestions}
                                        className="btn-confirm"
                                        disabled={confirmLoading}
                                    >
                                        {confirmLoading ? 'Saving...' : 'Confirm & Save'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {uploadMessage && (
                            <div className={uploadMessage.includes('✅') ? 'success-message' : uploadMessage.includes('⚠️') ? 'warning-message' : 'error-message'}>
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
                                        {roles.map(role => (
                                            <option key={role.value} value={role.value}>
                                                {role.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Level</label>
                                    <select
                                        value={linkLevel}
                                        onChange={(e) => setLinkLevel(e.target.value)}
                                    >
                                        {levels.map(level => (
                                            <option key={level.value} value={level.value}>
                                                {level.label}
                                            </option>
                                        ))}
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