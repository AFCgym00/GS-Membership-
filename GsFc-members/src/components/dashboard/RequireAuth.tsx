import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthProvider';
import { Spinner } from '@/components/ui/spinner';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/dashboard/login" replace />;
  }

  return <>{children}</>;
}
