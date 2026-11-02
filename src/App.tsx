import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Templates from './pages/Templates';
import Home, { ProjectsRoute } from './pages/Home';
import Editor from './pages/Editor';
import VideoEditor from './pages/VideoEditor';
import Videos from './pages/Videos';
import Present from './pages/Present';
import SharedView from './pages/SharedView';
import NotFound from './pages/NotFound';
import { ToastProvider } from './components/Toast';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      const t = window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
      return () => window.clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <ToastProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/projects" element={<ProjectsRoute />} />
        <Route path="/editor/:id" element={<Editor />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/video" element={<Navigate to="/videos" replace />} />
        <Route path="/video/:id" element={<VideoEditor />} />
        <Route path="/present/:id" element={<Present />} />
        <Route path="/view" element={<SharedView />} />
        <Route path="/designs" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ToastProvider>
  );
}
