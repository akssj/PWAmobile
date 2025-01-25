import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [message, setMessage] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [exchangeRates, setExchangeRates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const updateNetworkStatus = () => setIsOffline(!navigator.onLine);
  
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
  
    const fetchExchangeRates = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/data/getExchangeRates');
        const rates = response.data[0]?.rates || [];
        setExchangeRates(rates);
  
        localStorage.setItem('exchangeRates', JSON.stringify(rates));
      } catch (error) {
        console.error(error);
        setMessage('Wystąpił błąd przy pobieraniu danych.');
      }
    };
  
    if (navigator.onLine) {
      fetchExchangeRates();
    } else {
      const cachedRates = localStorage.getItem('exchangeRates');
      if (cachedRates) {
        setExchangeRates(JSON.parse(cachedRates));
      } else {
        setMessage('Brak danych w pamięci podręcznej.');
      }
      setIsOffline(true);
    }
  
    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);
  

  const handleAccountPress = () => navigate('/account');

  const handleLogoutPress = () => {
    if (window.confirm('Czy na pewno chcesz się wylogować?')) {
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
    exchangeRates.length > 0 ? (
      <div className="exchangeRatesGrid">
        {exchangeRates.map((rate, index) => (
          <div
            key={index}
            className="exchangeRateCard"
            onClick={() => handleCurrencyClick(rate.code)}
          >
            <div className="currencyName">{rate.currency}</div>
            <div className="rate">
              <div className="rateItem">
                Kupno: <span className="bidRate">{rate.bid.toFixed(4)}</span>
              </div>
              <div className="rateItem">
                Sprzedaż: <span className="askRate">{rate.ask.toFixed(4)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="message">Brak danych w pamięci podręcznej. Połącz się z internetem, aby pobrać dane.</p>
    )
  ) : (
          <>
            {message && <p className="message">{message}</p>}
            {exchangeRates.length > 0 ? (
              <div className="exchangeRatesGrid">
                {exchangeRates.map((rate, index) => (
                  <div
                    key={index}
                    className="exchangeRateCard"
                    onClick={() => handleCurrencyClick(rate.code)}
                  >
                    <div className="currencyName">{rate.currency}</div>
                    <div className="rate">
                      <div className="rateItem">
                        Kupno: <span className="bidRate">{rate.bid.toFixed(4)}</span>
                      </div>
                      <div className="rateItem">
                        Sprzedaż: <span className="askRate">{rate.ask.toFixed(4)}</span>
                      </div>
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
