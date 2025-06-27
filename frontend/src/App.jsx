import React, { useContext, useState } from 'react';
import AuthContext from './context/AuthContext';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import McqGeneratorPage from './components/McqGeneratorPage'; // Import the renamed component
import './App.css';

function App() {
  const { user } = useContext(AuthContext);
  const [showLogin, setShowLogin] = useState(true);

  if (!user) {
    return showLogin ? (
      <LoginPage onSwitchToRegister={() => setShowLogin(false)} />
    ) : (
      <RegisterPage onSwitchToLogin={() => setShowLogin(true)} />
    );
  }

  // If user is logged in, show the main application
  return <McqGeneratorPage />;
}

export default App;