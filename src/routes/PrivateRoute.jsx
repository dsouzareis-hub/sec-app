import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("http://localhost/api/me.php", {
          credentials: "include",
        });

        if (!res.ok) {
          setAuth(false);
          setLoading(false);
          return;
        }

        const data = await res.json();
        setAuth(!!data.user);
      } catch {
        setAuth(false);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  if (loading) return <p>Carregando...</p>;

  if (!auth) {
    return <Navigate to="/" replace />;
  }

  return children;
}