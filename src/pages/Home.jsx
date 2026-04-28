import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/index.css";
import "../styles/navbar.css";
import "../styles/footer.css";

export default function Home() {
  const [itens, setItens] = useState([]);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // 🔐 PROTEÇÃO DE ROTA
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost/api/me.php", {
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          console.log("AUTH ERROR:", data);
          navigate("/");
          return;
        }

        fetchItens();
      } catch (err) {
        console.log("AUTH FETCH ERROR:", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // 📦 LISTAR ITENS
  const fetchItens = async () => {
    try {
      const res = await fetch("http://localhost/api/itens.php", {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("GET ERROR:", data);
        return;
      }

      // 🔥 CORREÇÃO PRINCIPAL AQUI
      setItens(data.data || []);
    } catch (err) {
      console.log("FETCH ITENS ERROR:", err);
    }
  };

  // ➕ CRIAR / EDITAR
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editandoId) {
        const res = await fetch("http://localhost/api/itens.php", {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editandoId,
            nome,
            descricao,
          }),
        });

        const data = await res.json();

        if (!res.ok) console.log("UPDATE ERROR:", data);

        setEditandoId(null);
      } else {
        const res = await fetch("http://localhost/api/itens.php", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome,
            descricao,
          }),
        });

        const data = await res.json();

        if (!res.ok) console.log("INSERT ERROR:", data);
      }

      setNome("");
      setDescricao("");
      fetchItens();
    } catch (err) {
      console.log("SUBMIT ERROR:", err);
    }
  };

  // ✏️ EDITAR
  const handleEdit = (item) => {
    setNome(item.nome);
    setDescricao(item.descricao);
    setEditandoId(item.id);
  };

  // 🗑 DELETE
  const handleDelete = async (id) => {
    try {
      const res = await fetch("http://localhost/api/itens.php", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) console.log("DELETE ERROR:", data);

      fetchItens();
    } catch (err) {
      console.log("DELETE FETCH ERROR:", err);
    }
  };

  // ⏳ loading melhor
  if (loading) return <p>Carregando...</p>;

  return (
    <>
      <Navbar />

      <div className="container">
        <h2>Gerenciamento de Itens</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <input
            type="text"
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <button type="submit">
            {editandoId ? "Atualizar" : "Cadastrar"}
          </button>
        </form>

        <ul className="lista">
          {itens.map((item) => (
            <li key={item.id}>
              <strong>{item.nome}</strong> - {item.descricao}

              <div>
                <button onClick={() => handleEdit(item)}>Editar</button>
                <button onClick={() => handleDelete(item.id)}>
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Footer />
    </>
  );
}