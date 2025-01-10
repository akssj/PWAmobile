import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginSignUp from './Components/LoginSignUp/LoginSignUp';
import Home from './Components/Home/Home';
import Account from './Components/Account/Account';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignUp />} />
        <Route path="/home" element={<Home />} />
        <Route path="/account" element={<Account />} />
      </Routes>
    </Router>
  );
}

export default App;
