import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

  // 🔥 NOVO
  const [bloqueadoTempo, setBloqueadoTempo] = useState(0);

  const navigate = useNavigate();

  // 🔥 CONTADOR REGRESSIVO
  useEffect(() => {
    if (bloqueadoTempo <= 0) return;

    const interval = setInterval(() => {
      setBloqueadoTempo((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [bloqueadoTempo]);

  const handleLogin = async (e) => {
    e.preventDefault();

    // 🔥 BLOQUEIO NO FRONT
    if (loading || bloqueadoTempo > 0) return;

    setLoading(true);
    setErro("");

    try {
      if (!email || !senha) {
        setErro("Preencha todos os campos");
        setLoading(false);
        return;
      }

      const emailNormalizado = email.trim().toLowerCase();
      const senhaNormalizada = senha.trim();

      const response = await fetch("http://localhost/api/login.php", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailNormalizado,
          senha: senhaNormalizada,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErro(data.error || "Erro ao fazer login");

        // 🔥 PEGA TEMPO DO BACKEND
        if (data.retry_after) {
          setBloqueadoTempo(data.retry_after);
        }

        setLoading(false);
        return;
      }

      navigate("/home");

    } catch (err) {
      console.error(err);
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

          <button
            type="submit"
            disabled={loading || bloqueadoTempo > 0}
          >
            {bloqueadoTempo > 0
              ? `Aguarde ${bloqueadoTempo}s`
              : loading
              ? "Entrando..."
              : "Entrar"}
          </button>
        </form>

        {erro && <p className="erro">{erro}</p>}

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