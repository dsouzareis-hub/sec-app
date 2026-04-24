import "../styles/navbar.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import logo from "../images/logo_senai.jpg";

export default function Navbar() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  useEffect(() => {
    // 🔐 pega sessão atual
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
    };

    getSession();

    // 🔴 escuta login/logout em tempo real
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    window.location.href = "/";
  };

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