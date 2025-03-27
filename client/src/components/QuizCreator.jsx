import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './QuizCreator.css';

const QuizCreator = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadMethod, setUploadMethod] = useState('text'); // 'text' or 'file'

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please enter a quiz title');
      return;
    }

    if (uploadMethod === 'text' && !content.trim()) {
      setError('Please enter study content');
      return;
    }

    if (uploadMethod === 'file' && !file) {
      setError('Please select a file');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let quizContent;

      if (uploadMethod === 'file') {
        // Upload file first
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        quizContent = uploadResponse.data.result;
      } else {
        quizContent = content;
      }

      // Create quiz with content
      const { data } = await api.post('/quizzes/create', {
        title,
        description,
        content: quizContent
      });

      // Navigate to the new quiz
      navigate(`/quiz/${data._id}`);
    } catch (err) {
        console.error('Quiz creation error:', err);
        if (err.response) {
            console.error('Response status:', err.response.status);
            console.error('Response data:', err.response.data);
            setError(err.response.data.error || 'Failed to create quiz (server error)');
        } else if (err.request) {
            console.error('No response received:', err.request);
            setError('Failed to create quiz (no response from server)');
        } else {
            console.error('Request setup error:', err.message);
            setError('Failed to create quiz (request error)');
        }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const MAX_FILE_SIZE_MB = 5;
     const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

      if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
        setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit`);
       e.target.value = null; // Clear the file input

        return;
      }
      
      // Check file type
      const allowedTypes = ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Only text, PDF, and Word documents are supported');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  return (
    <div className="quiz-creator">
      <h1>Create a New Quiz</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Quiz Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your quiz"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a brief description of the quiz"
            rows="3"
          />
        </div>
        
        <div className="upload-method-selector">
          <div className="method-tabs">
            <button
              type="button"
              className={uploadMethod === 'text' ? 'active' : ''}
              onClick={() => setUploadMethod('text')}
            >
              Enter Text
            </button>
            <button
              type="button"
              className={uploadMethod === 'file' ? 'active' : ''}
              onClick={() => setUploadMethod('file')}
            >
              Upload File
            </button>
          </div>
          
          {uploadMethod === 'text' ? (
            <div className="form-group">
              <label htmlFor="content">Study Content</label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter the study material content here. The AI will generate quiz questions based on this content."
                rows="10"
                required
              />
            </div>
          ) : (
            <div className="form-group file-upload">
              <label htmlFor="file">Upload Study Material</label>
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                accept=".txt,.pdf,.doc,.docx"
              />
              {file && (
                <div className="file-info">
                  <p>Selected file: {file.name}</p>
                  <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
                </div>
              )}
              <p className="file-help">
                Supported formats: TXT, PDF, DOC, DOCX (Max 5MB)
              </p>
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate('/profile')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="create-button"
            disabled={loading}
          >
            {loading ? 'Creating Quiz...' : 'Create Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizCreator;