import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [balances, setBalances] = useState([]);
  const [message, setMessage] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleNetworkStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    window.addEventListener('online', handleNetworkStatus);
    window.addEventListener('offline', handleNetworkStatus);

    if (navigator.onLine) {
      axios
        .post('http://localhost:3000/api/auth/balance', {
          authorization: localStorage.getItem('token'),
        })
        .then((response) => {
          setBalances(response.data);
        })
        .catch((error) => {
          console.error(error);
          setMessage('Wystąpił błąd przy pobieraniu danych.');
        });
    } else {
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener('online', handleNetworkStatus);
      window.removeEventListener('offline', handleNetworkStatus);
    };
  }, []);

  const handleHomePress = () => {
    navigate('/home');
  };

  const handleLogoutPress = () => {
    const confirmLogout = window.confirm('Czy na pewno chcesz się wylogować?');
    if (confirmLogout) {
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  return (
    <div className="home-container">
      <div className="navbar">
      <div className="navButton" onClick={handleHomePress}>
          <span className="navButtonText">Home</span>
        </div>
        <div className="navButton" onClick={handleLogoutPress}>
          <span className="navButtonText">Wyloguj</span>
        </div>
      </div>
      <div className="content">
        {isOffline ? (
          <p className="message">Jesteś offline. Wyświetlane są dane w pamięci podręcznej.</p>
        ) : (
          <>
            <p className="message">{message}</p>
            {balances.length > 0 ? (
              <div className="balancesGrid">
                {balances.map((balance) => (
                  <div key={balance.id} className="balanceCard">
                    <div className="currencyName">{balance.currency}</div>
                    <div className="balanceAmount">Saldo: {balance.balance.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="message">Ładowanie danych konta...</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
