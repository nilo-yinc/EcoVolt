import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg, #0d1f2d)' }}>
      <main className="p-5">
        <Dashboard />
      </main>
    </div>
  );
}