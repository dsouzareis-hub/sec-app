import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
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

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/");
        return;
      }

      setLoading(false);
      fetchItens();
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          navigate("/");
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchItens = async () => {
    const { data, error } = await supabase.from("itens").select("*");

    if (error) {
      console.log("SELECT ERROR:", error);
      return;
    }

    setItens(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/");
      return;
    }

    if (editandoId) {
      const { error } = await supabase
        .from("itens")
        .update({ nome, descricao })
        .eq("id", editandoId);

      if (error) console.log("UPDATE ERROR:", error);

      setEditandoId(null);
    } else {
      const { error } = await supabase.from("itens").insert([
        {
          nome,
          descricao,
          user_id: user.id, // 🔥 ESSENCIAL para RLS
        },
      ]);

      if (error) console.log("INSERT ERROR:", error);
    }

    setNome("");
    setDescricao("");
    fetchItens();
  };

  const handleEdit = (item) => {
    setNome(item.nome);
    setDescricao(item.descricao);
    setEditandoId(item.id);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from("itens")
      .delete()
      .eq("id", id);

    if (error) console.log("DELETE ERROR:", error);

    fetchItens();
  };

  if (loading) return null;

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