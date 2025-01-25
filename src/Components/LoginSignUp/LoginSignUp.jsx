import { useState } from 'react';
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
    navigate('/home');
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      alert('Proszę wypełnić oba pola.');
      return;
    }

    navigate('/home');
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
