import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CurrencyDetails = () => {
  const { currencyCode } = useParams();
  const [history, setHistory] = useState([]);
  const [currencyName, setCurrencyName] = useState('');
  const [message, setMessage] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [amount, setAmount] = useState('');
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleNetworkStatus = () => setIsOffline(!navigator.onLine);

    window.addEventListener('online', handleNetworkStatus);
    window.addEventListener('offline', handleNetworkStatus);

    const fetchCurrencyData = async () => {
      try {
        const response = await axios.get(
          `https://api.nbp.pl/api/exchangerates/rates/c/${currencyCode}/last/30/?format=json`
        );
        setCurrencyName(response.data.currency || 'Nieznana waluta');
        setHistory(response.data.rates || []);

        // Zapisz dane w pamięci podręcznej
        localStorage.setItem(
          `currencyDetails_${currencyCode}`,
          JSON.stringify({
            currency: response.data.currency,
            rates: response.data.rates,
          })
        );
      } catch (error) {
        console.error(error);
        setMessage('Nie udało się pobrać danych historii kursu.');
      }
    };

    if (navigator.onLine) {
      fetchCurrencyData();
    } else {
      // Pobierz dane z pamięci podręcznej
      const cachedData = localStorage.getItem(`currencyDetails_${currencyCode}`);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setCurrencyName(parsedData.currency || 'Nieznana waluta');
        setHistory(parsedData.rates || []);
      } else {
        setMessage('Brak danych w pamięci podręcznej.');
      }
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener('online', handleNetworkStatus);
      window.removeEventListener('offline', handleNetworkStatus);
    };
  }, [currencyCode]);

  const handleHomePress = () => navigate('/home');

  const handleLogoutPress = () => {
    if (window.confirm('Czy na pewno chcesz się wylogować?')) {
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  const handlePurchase = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Brak tokenu uwierzytelniającego.');

      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        setPurchaseMessage('Podaj prawidłową kwotę do zakupu.');
        return;
      }

      await axios.post('http://localhost:3000/api/trade/purchase', {
        target_currency: currencyCode,
        amount: parseFloat(amount),
        authorization: token,
      });

      setPurchaseMessage('Zakup udany!');
      setAmount('');
    } catch (error) {
      console.error(error);
      setPurchaseMessage(
        error.response?.data?.message || 'Wystąpił błąd podczas realizacji transakcji.'
      );
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
          <>
            <p className="message">
              Jesteś offline. Wyświetlane są dane z pamięci podręcznej.
            </p>
            <h1>Szczegóły waluty: {currencyName}</h1>
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
              <p className="message">Brak danych w pamięci podręcznej.</p>
            )}
          </>
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
}
export default CurrencyDetails;
