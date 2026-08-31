import { Navigate, Route, Routes } from 'react-router-dom';
import { OrderSummaryPage } from './pages/OrderSummaryPage';
import { ShoppingListPage } from './pages/ShoppingListPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<ShoppingListPage />} />
      <Route path="/summary" element={<OrderSummaryPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
