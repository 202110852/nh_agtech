import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { FarmChat } from './pages/farm/Chat'
import { FarmCRM } from './pages/farm/CRM'
import { FarmDashboard } from './pages/farm/Dashboard'
import { FarmDelivery } from './pages/farm/Delivery'
import { FarmOrders } from './pages/farm/Orders'
import { FarmSettings } from './pages/farm/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FarmDashboard />} />
        <Route path="/orders" element={<FarmOrders />} />
        <Route path="/delivery" element={<FarmDelivery />} />
        <Route path="/crm" element={<FarmCRM />} />
        <Route path="/chat" element={<FarmChat />} />
        <Route path="/settings" element={<FarmSettings />} />

        <Route path="/farm" element={<Navigate to="/" replace />} />
        <Route path="/farm/orders" element={<Navigate to="/orders" replace />} />
        <Route path="/farm/delivery" element={<Navigate to="/delivery" replace />} />
        <Route path="/farm/crm" element={<Navigate to="/crm" replace />} />
        <Route path="/farm/chat" element={<Navigate to="/chat" replace />} />
        <Route path="/farm/settings" element={<Navigate to="/settings" replace />} />
        <Route path="/consumer/*" element={<Navigate to="/" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
