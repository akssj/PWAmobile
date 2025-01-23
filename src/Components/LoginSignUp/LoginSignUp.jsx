import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginSignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Proszę wypełnić oba pola.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        password,
      });
      localStorage.setItem('token', response.data.token);
      alert('Logowanie zakończone sukcesem!');
      navigate('/home');
    } catch (error) {
      console.error('Błąd logowania:', error);
      alert('Nie udało się zalogować. Sprawdź swoje dane.');
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      alert('Proszę wypełnić oba pola.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/auth/register', {
        email,
        password,
      });
      localStorage.setItem('token', response.data.token);
      alert('Rejestracja zakończona sukcesem! Możesz się teraz zalogować.');
    } catch (error) {
      console.error('Błąd rejestracji:', error);
      alert('Rejestracja nie powiodła się. Spróbuj ponownie.');
    }
  };

  return (
    <div className="login-container">
      <header className="header">
        <h1>Login / Sign Up</h1>
      </header>
      <div className="inputs">
        <div className="input">
          <input
            type="email"
            placeholder="Wprowadź email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input">
          <input
            type="password"
            placeholder="Wprowadź hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
      <div className="submit-container">
        <button className="submit" onClick={handleLogin}>
          Zaloguj
        </button>
        <button className="submit" onClick={handleSignUp}>
          Zarejestruj
        </button>
      </div>
    </div>
  );
};

export default LoginSignUp;
