import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home">
      <h1>Welcome to the MERN Auth App</h1>
      <nav>
        <p><Link to="/register">Sign Up</Link></p>
        <p><Link to="/login">Sign In</Link></p>
      </nav>
    </div>
  );
};

export default Home;