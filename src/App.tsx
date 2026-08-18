import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RequireAdmin, RequireAuth, RequireFarm } from './components/auth/Guards'
import { LoginSheetProvider } from './components/auth/LoginSheet'
import { Landing } from './pages/Landing'
import { Login } from './pages/auth/Login'
import { AuthCallback } from './pages/auth/AuthCallback'
import { AdminLogin } from './pages/auth/AdminLogin'
import { FarmStore } from './pages/order/FarmStore'
import { Checkout } from './pages/order/Checkout'
import { OrderComplete } from './pages/order/OrderComplete'
import { MyOrders } from './pages/me/MyOrders'
import { MyOrderDetail } from './pages/me/MyOrderDetail'
import { FarmApply } from './pages/farm/Apply'
import { FarmApplyStatus } from './pages/farm/ApplyStatus'
import { FarmDashboard } from './pages/farm/Dashboard'
import { FarmOrders } from './pages/farm/Orders'
import { FarmDelivery } from './pages/farm/Delivery'
import { FarmSettings } from './pages/farm/Settings'
import { AdminDashboard } from './pages/admin/Dashboard'
import { AdminApplications } from './pages/admin/Applications'
import { AdminFarms } from './pages/admin/Farms'
import { AdminProducts } from './pages/admin/Products'
import { AdminOrders } from './pages/admin/Orders'
import { AdminDeposits } from './pages/admin/Deposits'
import { AdminShipments } from './pages/admin/Shipments'

export default function App() {
  return (
    <BrowserRouter>
      <LoginSheetProvider>
        <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/o/:farmSlug" element={<FarmStore />} />
        <Route
          path="/o/:farmSlug/checkout"
          element={
            <RequireAuth>
              <Checkout />
            </RequireAuth>
          }
        />
        <Route
          path="/me/orders"
          element={
            <RequireAuth>
              <MyOrders />
            </RequireAuth>
          }
        />
        <Route
          path="/me/orders/:orderId/complete"
          element={
            <RequireAuth>
              <OrderComplete />
            </RequireAuth>
          }
        />
        <Route
          path="/me/orders/:orderId"
          element={
            <RequireAuth>
              <MyOrderDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/apply"
          element={
            <RequireAuth>
              <FarmApply />
            </RequireAuth>
          }
        />
        <Route
          path="/apply/status"
          element={
            <RequireAuth>
              <FarmApplyStatus />
            </RequireAuth>
          }
        />

        <Route
          path="/farm"
          element={
            <RequireFarm>
              <FarmDashboard />
            </RequireFarm>
          }
        />
        <Route
          path="/farm/orders"
          element={
            <RequireFarm>
              <FarmOrders />
            </RequireFarm>
          }
        />
        <Route
          path="/farm/delivery"
          element={
            <RequireFarm>
              <FarmDelivery />
            </RequireFarm>
          }
        />
        <Route
          path="/farm/settings"
          element={
            <RequireFarm>
              <FarmSettings />
            </RequireFarm>
          }
        />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/applications"
          element={
            <RequireAdmin>
              <AdminApplications />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/farms"
          element={
            <RequireAdmin>
              <AdminFarms />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/products"
          element={
            <RequireAdmin>
              <AdminProducts />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <RequireAdmin>
              <AdminOrders />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/deposits"
          element={
            <RequireAdmin>
              <AdminDeposits />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/shipments"
          element={
            <RequireAdmin>
              <AdminShipments />
            </RequireAdmin>
          }
        />

        <Route path="/orders" element={<Navigate to="/farm/orders" replace />} />
        <Route path="/delivery" element={<Navigate to="/farm/delivery" replace />} />
        <Route path="/settings" element={<Navigate to="/farm/settings" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LoginSheetProvider>
    </BrowserRouter>
  )
}
