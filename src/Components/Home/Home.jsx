import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [message, setMessage] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [exchangeRates, setExchangeRates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handleNetworkStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    window.addEventListener('online', handleNetworkStatus);
    window.addEventListener('offline', handleNetworkStatus);

    if (navigator.onLine) {
      axios
        .get('http://localhost:3000/api/data/getExchangeRates')
        .then((response) => {
          const rates = response.data[0]?.rates || [];
          setExchangeRates(rates);
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

  const handleAccountPress = () => {
    navigate('/account');
  };

  const handleLogoutPress = () => {
    const confirmLogout = window.confirm('Czy na pewno chcesz się wylogować?');
    if (confirmLogout) {
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  const handleCurrencyClick = (currencyCode) => {
    navigate(`/currency/${currencyCode}`);
  };

  return (
    <div className="home-container">
      <div className="navbar">
        <div className="navButton" onClick={handleAccountPress}>
          <span className="navButtonText">Konto</span>
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
            {exchangeRates.length > 0 ? (
              <div className="exchangeRatesGrid">
                {exchangeRates.map((rate, index) => (
                  <div key={index} className="exchangeRateCard" onClick={() => handleCurrencyClick(rate.code)}>
                    <div className="currencyName">{rate.currency}</div>
                    <div className="rate">
                      <div className="rateItem">Kupno: <span className="bidRate">{rate.bid}</span></div>
                      <div className="rateItem">Sprzedaż: <span className="askRate">{rate.ask}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="message">Ładowanie kursów walut...</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
