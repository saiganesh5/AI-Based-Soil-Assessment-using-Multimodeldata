import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import Weather from './pages/Weather';
import DiseasePrediction from './pages/DiseasePrediction';

// Styles
import './index.css';

function App(): React.JSX.Element {
    return (
        <Router>
            <AuthProvider>
                <ThemeProvider>
                    <div className="min-h-screen flex flex-col">
                        <Routes>
                            {/* Public Routes with Navbar/Footer */}
                            <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
                            <Route path="/about" element={<><Navbar /><About /><Footer /></>} />
                            <Route path="/contact" element={<><Navbar /><Contact /><Footer /></>} />

                            {/* Auth Routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Protected Dashboard Route */}
                            <Route
                                path="/dashboard"
                                element={
                                    <PrivateRoute>
                                        <Dashboard />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/weather"
                                element={
                                    <PrivateRoute>
                                        <Weather />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/predict-disease"
                                element={
                                    <PrivateRoute>
                                        <DiseasePrediction />
                                    </PrivateRoute>
                                }
                            />
                        </Routes>
                    </div>
                </ThemeProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
