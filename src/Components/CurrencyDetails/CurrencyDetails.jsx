import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CurrencyDetails = () => {
  const { currencyCode } = useParams();
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [currencyName, setCurrencyName] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [amount, setAmount] = useState('');
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleNetworkStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    window.addEventListener('online', handleNetworkStatus);
    window.addEventListener('offline', handleNetworkStatus);

    axios
      .get(`http://localhost:3000/api/data/getCurrencyHistory/${currencyCode}?lastDays=30`)
      .then((response) => {
        const data = response.data;
        setCurrencyName(data.currency || 'Nieznana waluta');
        setHistory(data.rates || []);
      })
      .catch((error) => {
        console.error(error);
        setMessage('Nie udało się pobrać danych historii kursu.');
      });

    return () => {
      window.removeEventListener('online', handleNetworkStatus);
      window.removeEventListener('offline', handleNetworkStatus);
    };
  }, [currencyCode]);

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

  const handlePurchase = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setPurchaseMessage('Błąd: Brak tokenu uwierzytelniającego.');
      return;
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      setPurchaseMessage('Podaj prawidłową kwotę do zakupu.');
      return;
    }

    axios
      .post(
        'http://localhost:3000/api/trade/purchase',
        {
          target_currency: currencyCode,
          amount: parseFloat(amount),
          authorization: localStorage.getItem('token'),
        })
      .then((response) => {
        setPurchaseMessage(response.data.message || 'Zakup udany!');
        setAmount('');
      })
      .catch((error) => {
        setPurchaseMessage(
          error.response?.data?.message || 'Wystąpił błąd podczas realizacji transakcji.'
        );
      });
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
            <h1>Szczegóły waluty: {currencyName}</h1>
            {message && <p className="message">{message}</p>}

            <div className="purchaseSection">
              <h2>Zakup waluty</h2>
              <div>
                <label>
                  USD do kupienia:
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Wprowadź ilość"
                  />
                </label>
              </div>
              <button onClick={handlePurchase}>Kup za PLN</button>
              {purchaseMessage && <p className="purchaseMessage">{purchaseMessage}</p>}
            </div>

            {history.length > 0 ? (
              <table className="historyTable">
                <thead>
                  <tr>
                    <th> Data </th>
                    <th> Kurs kupna </th>
                    <th> Kurs sprzedaży </th>
                  </tr>
                </thead>
                <tbody>
                  {history
                    .slice()
                    .reverse()
                    .map((rate, index) => (
                      <tr key={index}>
                        <td>{rate.effectiveDate}</td>
                        <td className="bidRate">{rate.bid.toFixed(4)}</td>
                        <td className="askRate">{rate.ask.toFixed(4)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : (
              <p className="message">Ładowanie kursów walut...</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CurrencyDetails;
