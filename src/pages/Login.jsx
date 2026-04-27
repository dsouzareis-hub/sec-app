import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/index.css";
import "../styles/navbar.css";
import "../styles/footer.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const [tentativas, setTentativas] = useState(0);
  const [bloqueadoAte, setBloqueadoAte] = useState(null);
  const [tempoRestante, setTempoRestante] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const bloqueio = localStorage.getItem("bloqueadoAte");
    const tent = localStorage.getItem("tentativas");

    if (bloqueio) setBloqueadoAte(Number(bloqueio));
    if (tent) setTentativas(Number(tent));
  }, []);

  useEffect(() => {
    localStorage.setItem("tentativas", tentativas);

    if (bloqueadoAte) {
      localStorage.setItem("bloqueadoAte", bloqueadoAte);
    }
  }, [tentativas, bloqueadoAte]);

  useEffect(() => {
    if (!bloqueadoAte) return;

    const interval = setInterval(() => {
      const restante = Math.max(0, Math.floor((bloqueadoAte - Date.now()) / 1000));
      setTempoRestante(restante);

      if (restante <= 0) {
        setBloqueadoAte(null);
        setTentativas(0);
        localStorage.removeItem("bloqueadoAte");
        localStorage.removeItem("tentativas");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [bloqueadoAte]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;
    setErro("");

    if (bloqueadoAte && Date.now() < bloqueadoAte) {
      const novoBloqueio = bloqueadoAte + 30 * 1000;

      setBloqueadoAte(novoBloqueio);
      localStorage.setItem("bloqueadoAte", novoBloqueio);

      const restante = Math.floor((novoBloqueio - Date.now()) / 1000);
      setTempoRestante(restante);

      setErro(`Aguarde ${restante}s para tentar novamente`);
      return;
    }

    setLoading(true);

    try {
      if (!email || !senha) {
        setErro("Preencha todos os campos");
        setLoading(false);
        return;
      }

      const check = await fetch(
        "https://kxgkgrkkicjcfnovachm.functions.supabase.co/login-protect",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      if (check.status === 429) {
        const bloqueio = Date.now() + 60 * 1000;
        setBloqueadoAte(bloqueio);
        setErro("Muitas tentativas. Aguarde 60s.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        const novasTentativas = tentativas + 1;
        setTentativas(novasTentativas);

        if (novasTentativas >= 3) {
          const bloqueio = Date.now() + 60 * 1000;
          setBloqueadoAte(bloqueio);
          setErro("Muitas tentativas. Aguarde 60s.");
        } else {
          setErro(`Credenciais inválidas (${novasTentativas}/3)`);
        }

        setLoading(false);
        return;
      }

      setTentativas(0);
      setBloqueadoAte(null);
      localStorage.removeItem("tentativas");
      localStorage.removeItem("bloqueadoAte");

      navigate("/home");

    } catch {
      setErro("Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="container">
        <h2>Login</h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Senha"
            onChange={(e) => setSenha(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

                {erro && <p className="erro">{erro}</p>}

        {bloqueadoAte && tempoRestante > 0 && (
          <p className="erro">
            Aguarde {tempoRestante}s para tentar novamente
          </p>
        )}

        <div className="link-cadastro">
          <p>Não possui conta?</p>
          <span onClick={() => navigate("/cadastro")}>
            Cadastre-se
          </span>
        </div>
      </div>

      <Footer />
    </>
  );
}