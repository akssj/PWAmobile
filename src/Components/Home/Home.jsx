import { useEffect, useState } from 'react';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get('http://localhost:3000/api/data/testdata')
      .then(response => setMessage(response.data.message))
      .catch(error => console.log(error));
  }, []);

  return (
    <div className="home-container">
      <h1 className="home-title">Home</h1>
      <p className="home-message">{message}</p>
    </div>
  );
};

export default Home;
