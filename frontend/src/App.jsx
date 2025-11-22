import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import { PropertyProvider } from './context/PropertyContext';
import { ScheduleProvider } from './context/ScheduleContext';
import { FavoriteProvider } from './context/FavoriteContext';
import AppRoutes from './routes/AppRoutes';
import ToastContainer from './components/common/ToastContainer';

function App() {
  return (
    <UIProvider>
      <AuthProvider>
        <FavoriteProvider>
          <ScheduleProvider>
            <PropertyProvider>
              <AppRoutes />
              <ToastContainer />
            </PropertyProvider>
          </ScheduleProvider>
        </FavoriteProvider>
      </AuthProvider>
    </UIProvider>
  );
}

export default App;