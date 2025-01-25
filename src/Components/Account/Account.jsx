import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [balances, setBalances] = useState([]);
  const [buyHistory, setBuyHistory] = useState([]);
  const [sellHistory, setSellHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [amountToSell, setAmountToSell] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const handleNetworkStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    window.addEventListener('online', handleNetworkStatus);
    window.addEventListener('offline', handleNetworkStatus);

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Brak tokenu. Zaloguj się ponownie.');

        const [balancesResponse, buyHistoryResponse, sellHistoryResponse] = await Promise.all([
          axios.post('http://localhost:3000/api/auth/balance', { authorization: token }),
          axios.post('http://localhost:3000/api/auth/buyHistory', { authorization: token }),
          axios.post('http://localhost:3000/api/auth/sellHistory', { authorization: token }),
        ]);

        setBalances(balancesResponse.data);
        setBuyHistory(buyHistoryResponse.data);
        setSellHistory(sellHistoryResponse.data);
      } catch (error) {
        console.error(error);
        setMessage('Wystąpił błąd przy pobieraniu danych.');
      }
    };

    if (navigator.onLine) fetchData();
    else setIsOffline(true);

    return () => {
      window.removeEventListener('online', handleNetworkStatus);
      window.removeEventListener('offline', handleNetworkStatus);
    };
  }, []);

  const handleHomePress = () => navigate('/');

  const handleLogoutPress = () => {
    if (window.confirm('Czy na pewno chcesz się wylogować?')) {
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  const handleAddFunds = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Brak tokenu. Zaloguj się ponownie.');

      await axios.post('http://localhost:3000/api/trade/addFunds', { authorization: token });
      setMessage('Dodano środki!');
      const response = await axios.post('http://localhost:3000/api/auth/balance', {
        authorization: token,
      });
      setBalances(response.data);
    } catch (error) {
      console.error(error);
      setMessage('Wystąpił błąd podczas dodawania środków.');
    }
  };

  const handleSellCurrency = async (currency) => {
    try {
      if (amountToSell[currency] <= 0) {
        setMessage('Proszę podać prawidłową ilość do sprzedaży.');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) throw new Error('Brak tokenu. Zaloguj się ponownie.');

      await axios.post('http://localhost:3000/api/trade/sell', {
        source_currency: currency,
        amount: amountToSell[currency],
        authorization: token,
      });

      setMessage('Transakcja sprzedaży udana!');
      const response = await axios.post('http://localhost:3000/api/auth/balance', {
        authorization: token,
      });
      setBalances(response.data);
      setAmountToSell((prev) => ({ ...prev, [currency]: '' }));
    } catch (error) {
      console.error(error);
      setMessage('Wystąpił błąd podczas realizacji sprzedaży.');
    }
  };

  const handleInputChange = (e, currency) => {
    const { value } = e.target;
    setAmountToSell((prev) => ({ ...prev, [currency]: value }));
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
            <div className="balancesGrid">
              {balances.filter((balance) => balance.balance > 0).map((balance) => (
                <div key={balance.id} className="balanceCard">
                  <div className="currencyName">{balance.currency}</div>
                  <div className="balanceAmount">Saldo: {balance.balance.toFixed(2)}</div>
                  {balance.currency === 'PLN' ? (
                    <button className="addFundsButton" onClick={handleAddFunds}>
                      Add Funds
                    </button>
                  ) : (
                    <div className="sellAction">
                      <input
                        type="number"
                        value={amountToSell[balance.currency] || ''}
                        onChange={(e) => handleInputChange(e, balance.currency)}
                        placeholder="Ilość do sprzedaży"
                        min="0"
                      />
                      <button
                        className="sellButton"
                        onClick={() => handleSellCurrency(balance.currency)}
                      >
                        Sell
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <h3>Historia Zakupów</h3>
            {buyHistory.length > 0 ? (
              <ul>
                {buyHistory.map((item) => (
                  <li key={item.id}>
                    {item.amount} {item.target_currency} po kursie {item.ask}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Brak danych do wyświetlenia.</p>
            )}

            <h3>Historia Sprzedaży</h3>
            {sellHistory.length > 0 ? (
              <ul>
                {sellHistory.map((item) => (
                  <li key={item.id}>
                    {item.amount} {item.source_currency} sprzedane po kursie {item.bid}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Brak danych do wyświetlenia.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
