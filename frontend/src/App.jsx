import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { restoreGitHubPagesRedirect } from './main';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

const Workspace = lazy(() => import('./pages/Workspace'));
const Quest = lazy(() => import('./pages/Quest'));
const DiagnosticQuest = lazy(() => import('./pages/DiagnosticQuest'));
const SideMission = lazy(() => import('./pages/SideMission'));
const MissionV2 = lazy(() => import('./pages/MissionV2'));
const Inbox = lazy(() => import('./pages/Inbox'));
const Infrastructure = lazy(() => import('./pages/Infrastructure'));
const Career = lazy(() => import('./pages/Career'));
const Runbooks = lazy(() => import('./pages/Runbooks'));
const TrainingArchive = lazy(() => import('./pages/TrainingArchive'));
const LearningImport = lazy(() => import('./pages/LearningImport'));
const Settings = lazy(() => import('./pages/Settings'));
const Academy = lazy(() => import('./pages/Academy'));
const AcademyCategory = lazy(() => import('./pages/AcademyCategory'));
const AcademyTopic = lazy(() => import('./pages/AcademyTopic'));
const AcademyModeSelect = lazy(() => import('./pages/AcademyModeSelect'));
const AcademyPlacementTcpUdp = lazy(() => import('./pages/AcademyPlacementTcpUdp'));
const AcademyThemencheck = lazy(() => import('./pages/AcademyThemencheck'));

function Loading() {
  return <div className="app-shell flex items-center justify-center text-[#00ff66]">ansicht wird geladen...</div>;
}

function AppRoutes() {
  const { loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    restoreGitHubPagesRedirect(navigate);
  }, [navigate]);
  if (loading) return <Loading />;
  const secure = (element) => <ProtectedRoute>{element}</ProtectedRoute>;
  // Workspace is the only fullBleed (edge-to-edge, self-managed) route - it
  // renders the panorama and all its sub-views (apps, dialogs, desktop)
  // directly inside the AppShell's MainContent instead of escaping it via
  // fixed positioning (see Layout.jsx).
  const secureFullBleed = (element) => <ProtectedRoute fullBleed>{element}</ProtectedRoute>;
  return <Suspense fallback={<Loading />}><Routes>
    <Route path="/" element={secureFullBleed(<Workspace />)} />
    <Route path="/workspace" element={secureFullBleed(<Workspace />)} />
    <Route path="/quest/:questId" element={secure(<Quest />)} />
    <Route path="/diagnostic/:questId" element={secure(<DiagnosticQuest />)} />
    <Route path="/side-mission/:missionId" element={secure(<SideMission />)} />
    <Route path="/mission/:missionId" element={secure(<MissionV2 />)} />
    <Route path="/inbox" element={secure(<Inbox />)} />
    <Route path="/infrastructure" element={secure(<Infrastructure />)} />
    <Route path="/career" element={secure(<Career />)} />
    <Route path="/runbooks" element={secure(<Runbooks />)} />
    <Route path="/training" element={secure(<TrainingArchive />)} />
    <Route path="/import" element={secure(<LearningImport />)} />
    <Route path="/settings" element={secure(<Settings />)} />
    <Route path="/academy" element={secure(<Academy />)} />
    <Route path="/academy/mode" element={secure(<AcademyModeSelect />)} />
    <Route path="/academy/placement/tcp-udp" element={secure(<AcademyPlacementTcpUdp />)} />
    <Route path="/academy/themencheck/:categoryId" element={secure(<AcademyThemencheck />)} />
    <Route path="/academy/:categoryId" element={secure(<AcademyCategory />)} />
    <Route path="/academy/:categoryId/:topicId" element={secure(<AcademyTopic />)} />
    <Route path="*" element={<Navigate to="/" />} />
  </Routes></Suspense>;
}

export default function App() {
  return <ErrorBoundary><AuthProvider><AppRoutes /></AuthProvider></ErrorBoundary>;
}
