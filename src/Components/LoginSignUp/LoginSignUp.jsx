import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginSignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:3000/api/auth/login", {
        email,
        password
      });
      console.log("Login successful:", response.data);
      localStorage.setItem("token", response.data.token);
      alert("Login successful!");
      navigate('/home');
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please check your credentials.");
    }
  };

  const handleSignUp = async () => {
    try {
      const response = await axios.post("http://localhost:3000/api/auth/register", {
        email,
        password
      });
      console.log("Sign Up successful:", response.data);
      localStorage.setItem("token", response.data.token);
      alert("Sign Up successful!");
      navigate('/home');
    } catch (error) {
      console.error("Sign Up failed:", error);
      alert("Sign Up failed. Please try again.");
    }
  };

  return (
    <div className='login-container'>
      <div className="header">
        <div className="text">Login / Sign Up</div>
      </div>
      <div className="inputs">
        <div className="input">
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input">
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <div className="submit-container">
        <div
          className="submit"
          onClick={handleLogin}
        >
          Login
        </div>
        <div
          className="submit"
          onClick={handleSignUp}
        >
          Sign Up
        </div>
      </div>
    </div>
  );
};

export default LoginSignUp;
