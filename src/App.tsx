import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, RequireAuth } from 'miaoda-auth-react';
import { supabase } from '@/db/supabase';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import routes from './routes';

function App() {
  return (
    <Router>
      <AuthProvider client={supabase}>
        <RequireAuth whiteList={['/login']}>
          <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <MobileNav />
              <main className="flex-1 overflow-auto">
                <Routes>
                  {routes.map((route, index) => (
                    <Route
                      key={index}
                      path={route.path}
                      element={route.element}
                    />
                  ))}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        </RequireAuth>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
