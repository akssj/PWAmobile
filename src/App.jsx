import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Components/Home/Home';
import Account from './Components/Account/Account';
import CurrencyDetails from './Components/CurrencyDetails/CurrencyDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/account" element={<Account />} />
        <Route path="/currency/:currencyCode" element={<CurrencyDetails />} />
      </Routes>
    </Router>
  );
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
              console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch(error => {
              console.error('Service Worker registration failed:', error);
          });
  });
}

export default App;
