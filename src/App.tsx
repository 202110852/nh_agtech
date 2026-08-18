import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { RequireAdmin, RequireAuth, RequireFarm } from './components/auth/Guards'
import { LoginSheetProvider } from './components/auth/LoginSheet'
import { Landing } from './pages/Landing'
import { Login } from './pages/auth/Login'
import { AuthCallback } from './pages/auth/AuthCallback'
import { AdminLogin } from './pages/auth/AdminLogin'
import { FarmStore } from './pages/order/FarmStore'
import { FarmLanding } from './pages/order/FarmLanding'
import { Checkout } from './pages/order/Checkout'
import { OrderComplete } from './pages/order/OrderComplete'
import { MyOrders } from './pages/me/MyOrders'
import { MyOrderDetail } from './pages/me/MyOrderDetail'
import { AdminFarmLayout, FarmOwnerLayout } from './lib/farmWorkspace'
import { FarmDashboard } from './pages/farm/Dashboard'
import { FarmOrders } from './pages/farm/Orders'
import { FarmDelivery } from './pages/farm/Delivery'
import { FarmProducts } from './pages/farm/Products'
import { FarmSettings } from './pages/farm/Settings'
import { AdminDashboard } from './pages/admin/Dashboard'
import { AdminFarms } from './pages/admin/Farms'
import { AdminOrders } from './pages/admin/Orders'
import { AdminDeposits } from './pages/admin/Deposits'
import { AdminShipments } from './pages/admin/Shipments'

function RedirectLegacyStore({ suffix = '' }: { suffix?: string }) {
  const { farmSlug = '' } = useParams()
  return <Navigate to={`/farm/${farmSlug}${suffix}`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <LoginSheetProvider>
        <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/o/:farmSlug" element={<RedirectLegacyStore />} />
        <Route path="/o/:farmSlug/checkout" element={<RedirectLegacyStore suffix="/checkout" />} />
        <Route path="/farm" element={<Navigate to="/manage" replace />} />
        <Route path="/farm/products" element={<Navigate to="/manage/products" replace />} />
        <Route path="/farm/orders" element={<Navigate to="/manage/orders" replace />} />
        <Route path="/farm/delivery" element={<Navigate to="/manage/delivery" replace />} />
        <Route path="/farm/settings" element={<Navigate to="/manage/settings" replace />} />
        <Route path="/farm/:farmSlug" element={<FarmStore />} />
        <Route path="/farm/:farmSlug/landingpage" element={<FarmLanding />} />
        <Route
          path="/farm/:farmSlug/checkout"
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
        <Route path="/apply" element={<Navigate to="/" replace />} />
        <Route path="/apply/status" element={<Navigate to="/" replace />} />
        <Route
          path="/manage"
          element={
            <RequireFarm>
              <FarmOwnerLayout />
            </RequireFarm>
          }
        >
          <Route index element={<FarmDashboard />} />
          <Route path="products" element={<FarmProducts />} />
          <Route path="orders" element={<FarmOrders />} />
          <Route path="delivery" element={<FarmDelivery />} />
          <Route path="settings" element={<FarmSettings />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
        <Route path="/admin/applications" element={<Navigate to="/admin/farms" replace />} />
        <Route
          path="/admin/farms"
          element={
            <RequireAdmin>
              <AdminFarms />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/farms/:farmId"
          element={
            <RequireAdmin>
              <AdminFarmLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<FarmDashboard />} />
          <Route path="products" element={<FarmProducts />} />
          <Route path="orders" element={<FarmOrders />} />
          <Route path="delivery" element={<FarmDelivery />} />
          <Route path="settings" element={<FarmSettings />} />
        </Route>
        <Route path="/admin/products" element={<Navigate to="/admin/farms" replace />} />
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

        <Route path="/orders" element={<Navigate to="/manage/orders" replace />} />
        <Route path="/delivery" element={<Navigate to="/manage/delivery" replace />} />
        <Route path="/settings" element={<Navigate to="/manage/settings" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LoginSheetProvider>
    </BrowserRouter>
  )
}
