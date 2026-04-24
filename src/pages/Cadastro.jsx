import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
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

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const handleCadastro = async (e) => {
    e.preventDefault();

    if (loading) return;
    setLoading(true);

    await delay(1000);

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

      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
      });

if (error) {
  console.error(error);
  alert(error.message);
  setLoading(false);
  return;
}

      const { error: dbError } = await supabase.from("usuarios").insert([
        {
          nome,
          email,
          user_id: data.user.id,
          data: new Date(),
        },
      ]);

      if (dbError) {
        alert("Erro ao salvar dados");
        setLoading(false);
        return;
      }

      alert("Cadastro realizado com sucesso!");
      navigate("/");

    } catch (err) {
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
            <span onClick={() => navigate("/")}>Fazer login</span>
          </p>
          
        </form>
      </div>

      <Footer />
    </>
  );
}