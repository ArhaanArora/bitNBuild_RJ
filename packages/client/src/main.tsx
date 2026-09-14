import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import { AdminAuthProvider } from './hooks/useAdminAuth';
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AdminAuthProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                style: { background: '#17171A', color: '#F5F5F4', border: '1px solid #2A2A2E' },
                success: { iconTheme: { primary: '#3FB65F', secondary: '#0D0D0F' } },
                error: { iconTheme: { primary: '#E0554E', secondary: '#0D0D0F' } },
              }}
            />
          </AdminAuthProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
