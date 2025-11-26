import { GoogleLogin } from '@react-oauth/google';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
    const handleSuccess = async (credentialResponse) => {
        try {
            // Send Google credential to backend
            const response = await fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    credential: credentialResponse.credential,
                }),
            });

            if (!response.ok) {
                throw new Error('Authentication failed');
            }

            const data = await response.json();

            // Store JWT token and user info in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            onLoginSuccess(data.user);
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please try again.');
        }
    };

    const handleError = () => {
        console.error('Login Failed');
        alert('Login failed. Please try again.');
    };

    return (
        <div className="login-container">
            <div className="login-background">
                <div className="login-overlay"></div>
            </div>

            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">
                        <span className="login-logo-icon">🌱</span>
                        <h1 className="login-logo-text">Goreverse AgroBook</h1>
                    </div>
                    <p className="login-slogan">Where Every Harvest Matters</p>
                </div>

                <div className="login-content">
                    <h2 className="login-title">Welcome to Your Farm Management System</h2>
                    <p className="login-subtitle">
                        Track expenses, manage crops, and maximize your farm's profitability
                    </p>

                    <div className="login-features">
                        <div className="feature-item">
                            <span className="feature-icon">💰</span>
                            <span className="feature-text">Track Revenue & Expenses</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">🌾</span>
                            <span className="feature-text">Manage Crops & Fields</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">📊</span>
                            <span className="feature-text">Analyze Performance</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">🌍</span>
                            <span className="feature-text">Multi-language Support</span>
                        </div>
                    </div>

                    <div className="login-button-container">
                        <p className="login-instruction">Sign in with your Google account to continue</p>
                        <div className="google-login-wrapper">
                            <GoogleLogin
                                onSuccess={handleSuccess}
                                onError={handleError}
                                theme="filled_blue"
                                size="large"
                                text="signin_with"
                                shape="rectangular"
                                logo_alignment="left"
                            />
                        </div>
                    </div>
                </div>

                <div className="login-footer">
                    <p className="developer-credit">
                        Designed & Developed by <strong>Abhijit Gore</strong>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
