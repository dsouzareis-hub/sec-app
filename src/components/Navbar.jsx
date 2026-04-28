import "../styles/navbar.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../images/logo_senai.jpg";

export default function Navbar() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 verifica sessão no backend PHP
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("http://localhost/api/me.php", {
          credentials: "include",
        });

        if (!res.ok) {
          setSession(null);
          return;
        }

        const data = await res.json();
        setSession(data.user);
      } catch (err) {
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // 🔴 logout PHP (sessão server-side)
  const handleLogout = async () => {
    try {
      await fetch("http://localhost/api/logout.php", {
        method: "POST",
        credentials: "include",
      });

      // limpa estado local imediatamente
      setSession(null);

      // redireciona
      navigate("/");
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
    }
  };

  if (loading) return null;

  return (
    <nav className="navbar">
      <div
        className="navbar-left"
        onClick={() => navigate(session ? "/home" : "/")}
      >
        <img src={logo} alt="Logo SENAI" className="logo" />
      </div>

      <div className="navbar-right">
        {session ? (
          <>
            <button onClick={() => navigate("/home")}>Home</button>
            <button className="logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button onClick={() => navigate("/")}>Login</button>
            <button onClick={() => navigate("/cadastro")}>
              Cadastro
            </button>
          </>
        )}
      </div>
    </nav>
  );
}