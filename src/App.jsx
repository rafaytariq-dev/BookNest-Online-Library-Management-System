import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BookProvider } from './context/BookContext';
import { UserProvider } from './context/UserContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import BookDetailsPage from './pages/BookDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ContactPage from './pages/ContactPage';

function App() {
    return (
        <BrowserRouter>
            <UserProvider>
                <BookProvider>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<HomePage />} />
                            <Route path="book/:id" element={<BookDetailsPage />} />
                            <Route path="login" element={<LoginPage />} />
                            <Route path="signup" element={<SignupPage />} />
                            <Route path="contact" element={<ContactPage />} />

                            {/* Protected Routes */}
                            <Route path="cart" element={
                                <ProtectedRoute>
                                    <CartPage />
                                </ProtectedRoute>
                            } />
                            <Route path="checkout" element={
                                <ProtectedRoute>
                                    <CheckoutPage />
                                </ProtectedRoute>
                            } />
                            <Route path="confirmation" element={
                                <ProtectedRoute>
                                    <ConfirmationPage />
                                </ProtectedRoute>
                            } />
                            <Route path="dashboard" element={
                                <ProtectedRoute>
                                    <DashboardPage />
                                </ProtectedRoute>
                            } />
                        </Route>
                    </Routes>
                </BookProvider>
            </UserProvider>
        </BrowserRouter>
    );
}

export default App;
