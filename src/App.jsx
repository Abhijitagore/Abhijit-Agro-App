import { useState, createContext, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';
import Dashboard from './components/Dashboard';
import Expenses from './components/Expenses';
import Revenue from './components/Revenue';
import Crops from './components/Crops';
import Fields from './components/Fields';
import Analytics from './components/Analytics';
import Login from './components/Login';
import { getTranslation } from './translations';
import { ExpensesProvider } from './context/ExpensesContext';
import { RevenueProvider } from './context/RevenueContext';
import { CropsProvider } from './context/CropsContext';
import { FieldsProvider } from './context/FieldsContext';
import UserContext from './context/UserContext';

export const LanguageContext = createContext();

// Replace with your actual Google Client ID
const GOOGLE_CLIENT_ID = "121241610750-hqetga0d1qk9rimltdnu0qrvt981t373.apps.googleusercontent.com";

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [language, setLanguage] = useState('en'); // en, hi, mr
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (userInfo) => {
    setUser(userInfo);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setActiveTab('dashboard');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const t = (key) => getTranslation(language, key);

  const tabs = [
    { id: 'dashboard', label: t('dashboard'), icon: '📊' },
    { id: 'expenses', label: t('expenses'), icon: '💰' },
    { id: 'revenue', label: t('revenue'), icon: '💵' },
    { id: 'crops', label: t('crops'), icon: '🌾' },
    { id: 'fields', label: t('fields'), icon: '🏞️' },
    { id: 'analytics', label: t('analytics'), icon: '📈' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'expenses':
        return <Expenses />;
      case 'revenue':
        return <Revenue />;
      case 'crops':
        return <Crops />;
      case 'fields':
        return <Fields />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0f172a',
        color: '#fff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌱</div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <UserContext.Provider value={user}>
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
          <ExpensesProvider>
            <RevenueProvider>
              <CropsProvider>
                <FieldsProvider>
                  {!user ? (
                    <Login onLoginSuccess={handleLoginSuccess} />
                  ) : (
                    <div className="app">
                      {/* Mobile Menu Toggle */}
                      <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                        <span></span>
                        <span></span>
                        <span></span>
                      </button>

                      {/* Mobile Overlay */}
                      <div
                        className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
                        onClick={closeMobileMenu}
                      ></div>

                      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                        <div className="sidebar-header">
                          <div className="logo">
                            <span className="logo-icon">🌱</span>
                            <h1 className="logo-text">{t('appName')}</h1>
                          </div>
                          <p className="logo-subtitle">{t('appSlogan')}</p>
                        </div>

                        <nav className="nav">
                          {tabs.map((tab) => (
                            <button
                              key={tab.id}
                              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                              onClick={() => {
                                setActiveTab(tab.id);
                                closeMobileMenu();
                              }}
                            >
                              <span className="nav-icon">{tab.icon}</span>
                              <span className="nav-label">{tab.label}</span>
                            </button>
                          ))}
                        </nav>

                        <div className="sidebar-footer">
                          <div className="language-selector">
                            <label className="language-label">Language / भाषा / भाषा</label>
                            <select
                              className="language-select"
                              value={language}
                              onChange={(e) => setLanguage(e.target.value)}
                            >
                              <option value="en">English</option>
                              <option value="hi">हिंदी</option>
                              <option value="mr">मराठी</option>
                            </select>
                          </div>

                          <div className="user-profile">
                            <img
                              src={user.picture}
                              alt={user.name}
                              className="user-avatar-img"
                            />
                            <div className="user-info">
                              <div className="user-name">
                                {user.name}
                                {user.is_admin && <span style={{ marginLeft: '8px', fontSize: '0.85em', background: '#ef4444', padding: '2px 6px', borderRadius: '4px' }}>👑 ADMIN</span>}
                              </div>
                              <button className="logout-btn" onClick={handleLogout}>
                                Logout
                              </button>
                            </div>
                          </div>

                          <div className="developer-footer">
                            <p className="developer-text">
                              Designed & Developed by <strong>Abhijit Gore</strong>
                            </p>
                          </div>
                        </div>
                      </aside>

                      <main className="main-content">
                        <div className="content-wrapper animate-fade-in">
                          {renderContent()}
                        </div>
                      </main>
                    </div>
                  )}
                </FieldsProvider>
              </CropsProvider>
            </RevenueProvider>
          </ExpensesProvider>
        </LanguageContext.Provider>
      </UserContext.Provider>
    </GoogleOAuthProvider>
  );
}

export default App;
