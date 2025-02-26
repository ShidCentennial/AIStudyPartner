import { useEffect, useState } from "react";
import api from "../utils/api";

const Profile = () => {
  const [user, setUser] = useState(null);

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

  return (
    <div className="profile">
      {user ? (
        <>
          <h1>Profile</h1>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Profile;