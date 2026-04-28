import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/index.css";
import "../styles/navbar.css";
import "../styles/footer.css";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleCadastro = async (e) => {
    e.preventDefault();

    if (loading) return;
    setLoading(true);

    try {
      if (!nome || !email || !senha) {
        alert("Preencha todos os campos");
        setLoading(false);
        return;
      }

      if (senha.length < 8) {
        alert("Senha deve ter no mínimo 8 caracteres");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost/api/cadastro.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          email,
          senha,
        }),
      });

      // 🔥 IMPORTANTE: pega texto bruto primeiro
      const text = await response.text();
      console.log("RESPOSTA BRUTA PHP:", text);

      let data;

      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("Resposta não é JSON válido:", text);
        alert("Erro no servidor (PHP não retornou JSON)");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        alert(data.error || "Erro ao cadastrar");
        setLoading(false);
        return;
      }

      alert("Cadastro realizado com sucesso!");
      navigate("/");

    } catch (err) {
      console.error("ERRO FRONT:", err);
      alert("Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="container">
        <h2>Cadastro</h2>

        <form onSubmit={handleCadastro}>
          <input
            type="text"
            placeholder="Nome"
            onChange={(e) => setNome(e.target.value)}
          />

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
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>

          <p className="link-login">
            Já possui conta?{" "}
            <span onClick={() => navigate("/")}>
              Fazer login
            </span>
          </p>
        </form>
      </div>

      <Footer />
    </>
  );
}