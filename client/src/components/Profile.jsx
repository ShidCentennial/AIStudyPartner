import { useEffect, useState } from "react";
import api from "../utils/api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/auth/profile");
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post("/upload", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data.result);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  return (
    <div className="profile">
      {user ? (
        <>
          <h1>Profile</h1>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
          <div style={{ marginTop: '2rem' }}>
            <h2>File Upload Test</h2>
            <form onSubmit={handleUpload}>
              <input 
                type="file" 
                onChange={(e) => setFile(e.target.files[0])} 
              />
              <button type="submit">Process with OpenAI</button>
            </form>
            {result && (
              <div>
                <h3>Result:</h3>
                <p>{result}</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Profile;