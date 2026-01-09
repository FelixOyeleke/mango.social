import { Outlet, useLocation } from 'react-router-dom';
import AuthenticatedHeader from './AuthenticatedHeader';
import Footer from './Footer';
import { useAuthStore } from '../store/authStore';
import { FullPageLoader } from './LoadingSpinner';

export default function Layout() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuthStore();

  // Always show AuthenticatedHeader (it handles both authenticated and non-authenticated states)
  const showAuthHeader = !isLoading;

  // Only show footer on marketing pages when not authenticated
  const marketingPages = ['/', '/login', '/register'];
  const isMarketingPage = marketingPages.includes(location.pathname);
  const showFooter = !isAuthenticated && isMarketingPage && !isLoading;

  // Show loading state while checking auth
  if (isLoading) {
    return <FullPageLoader />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {showAuthHeader && <AuthenticatedHeader />}
      <main className="flex-grow">
        <Outlet />
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
