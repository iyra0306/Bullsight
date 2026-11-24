import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { CustomCursor } from './components/CustomCursor';
import { DashboardLayout } from './components/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { OverviewPage } from './pages/OverviewPage';
import { ExploreStocksPage } from './pages/ExploreStocksPage';
import { StockDetailPage } from './pages/StockDetailPage';
import { AiPredictionPage } from './pages/AiPredictionPage';
import { TechnicalAnalysisPage } from './pages/TechnicalAnalysisPage';
import { MarketNewsPage } from './pages/MarketNewsPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <CustomCursor />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/forgot-password" element={<AuthPage mode="forgot" />} />

          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="explore" element={<ExploreStocksPage />} />
            <Route path="analysis" element={<StockDetailPage />} />
            <Route path="stocks/:symbol" element={<StockDetailPage />} />
            <Route path="predictions" element={<AiPredictionPage />} />
            <Route path="technicals" element={<TechnicalAnalysisPage />} />
            <Route path="news" element={<MarketNewsPage />} />
            <Route path="watchlist" element={<WatchlistPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
