import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CitizenLandingPage } from './pages/CitizenLandingPage';
import { CitizenReportWizardPage } from './pages/CitizenReportWizardPage';
import { TrackSearchPage } from './pages/TrackSearchPage';
import { TicketTrackDetailPage } from './pages/TicketTrackDetailPage';
import { PublicMapPage } from './pages/PublicMapPage';
import { AuthorityLoginPage } from './pages/AuthorityLoginPage';
import { AuthorityDashboardPage } from './pages/AuthorityDashboardPage';
import { AuthorityReportDetailPage } from './pages/AuthorityReportDetailPage';
import { AuthorityEscalatedPage } from './pages/AuthorityEscalatedPage';

export function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-surface">
        <Navbar />

        <main className="flex-1 w-full pt-16">
          <Routes>
            {/* Citizen Routes */}
            <Route path="/" element={<CitizenLandingPage />} />
            <Route path="/report" element={<CitizenReportWizardPage />} />
            <Route path="/track" element={<TrackSearchPage />} />
            <Route path="/track/:ticketId" element={<TicketTrackDetailPage />} />

            {/* Public Map */}
            <Route path="/map" element={<PublicMapPage />} />

            {/* Authority Routes */}
            <Route path="/authority/login" element={<AuthorityLoginPage />} />
            <Route path="/authority" element={<AuthorityDashboardPage />} />
            <Route path="/authority/reports/:id" element={<AuthorityReportDetailPage />} />
            <Route path="/authority/escalated" element={<AuthorityEscalatedPage />} />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
