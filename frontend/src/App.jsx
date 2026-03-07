import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CCTVBackground from './components/CCTVBackground';

// ── Pages ──
import HomeGateway from './pages/HomeGateway';
import Dashboard from './pages/Dashboard';
import CampusOverview from './pages/CampusOverview';
import HeatmapView from './pages/HeatmapView';
import Rooms from './pages/Rooms';
import RoomDetail from './pages/RoomDetail';
import GhostView from './pages/GhostView';
import ComputerLabIntelligence from './pages/ComputerLabIntelligence';
import EnergyAnalytics from './pages/EnergyAnalytics';
import EnergyAlerts from './pages/EnergyAlerts';
import ManualControl from './pages/ManualControl';
import Devices from './pages/Devices';
import AuditLogs from './pages/AuditLogs';
import RuleConfiguration from './pages/RuleConfiguration';
import PrivacyCompliance from './pages/PrivacyCompliance';
import Settings from './pages/Settings';
import LandingPage from './pages/LandingPage';

function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-screen w-screen bg-[#060b14]" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <CCTVBackground />
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden relative z-10">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-5 relative z-10">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/campus" element={<CampusOverview />} />
            <Route path="/heatmap" element={<HeatmapView />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/rooms/:roomId" element={<RoomDetail />} />
            <Route path="/room/:roomId" element={<RoomDetail />} />
            <Route path="/ghost-view" element={<GhostView />} />
            <Route path="/computer-labs" element={<ComputerLabIntelligence />} />
            <Route path="/energy-analytics" element={<EnergyAnalytics />} />
            <Route path="/energy-alerts" element={<EnergyAlerts />} />
            <Route path="/manual-control" element={<ManualControl />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/rules" element={<RuleConfiguration />} />
            <Route path="/privacy" element={<PrivacyCompliance />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<HomeGateway />} />
      <Route path="/auth" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}
