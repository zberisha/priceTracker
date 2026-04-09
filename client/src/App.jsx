import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import PrivateRoute from '@/components/PrivateRoute/PrivateRoute';
import Home from '@/pages/Home/Home';
import Login from '@/pages/Login/Login';
import Register from '@/pages/Register/Register';
import Dashboard from '@/pages/Dashboard/Dashboard';
import Products from '@/pages/Products/Products';
import ProductDetail from '@/pages/ProductDetail/ProductDetail';
import Categories from '@/pages/Categories/Categories';
import Competitors from '@/pages/Competitors/Competitors';
import Alerts from '@/pages/Alerts/Alerts';
import Tracking from '@/pages/Tracking/Tracking';
import Subscription from '@/pages/Subscription/Subscription';
import Admin from '@/pages/Admin/Admin';
import NotFound from '@/pages/NotFound/NotFound';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/competitors" element={<Competitors />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/tracking" element={<Tracking />} />
                  <Route path="/subscription" element={<Subscription />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;
