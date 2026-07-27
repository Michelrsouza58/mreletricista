// src/components/auth/AuthModals.jsx
import React, { useState } from 'react';
import './AuthModals.css';
import { db } from '../../services/firebase';
import { ref, push, set, get, query, orderByChild, equalTo } from 'firebase/database';

export default function AuthModals({
  showLoginModal,
  setShowLoginModal,
  showRegisterModal,
  setShowRegisterModal,
  onLoginSuccess
}) {
  // Estados para Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Estados para Cadastro
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    telefone: '',
    email: '',
    dataNascimento: '',
    senha: '',
    confirmarSenha: ''
  });

  const [loading, setLoading] = useState(false);

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // LOGIN NO REALTIME DATABASE
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const emailTratado = loginEmail.toLowerCase().trim();
      const usuariosRef = ref(db, 'usuarios');
      const emailQuery = query(usuariosRef, orderByChild('email'), equalTo(emailTratado));
      
      const snapshot = await get(emailQuery);

      if (snapshot.exists()) {
        const data = snapshot.val();
        // Procura a chave do usuário que bate com a senha
        const userId = Object.keys(data).find(key => data[key].senha === loginPassword);

        if (userId) {
          const userData = data[userId];
          alert(`Bem-vindo(a) de volta, ${userData.nomeCompleto}!`);
          setShowLoginModal(false);
          if (onLoginSuccess) onLoginSuccess({ id: userId, ...userData });
        } else {
          alert('Senha incorreta.');
        }
      } else {
        alert('E-mail não cadastrado.');
      }
    } catch (error) {
      console.error('Erro ao realizar login:', error);
      alert('Erro ao conectar ao Realtime Database. Verifique suas regras no console.');
    } finally {
      setLoading(false);
    }
  };

  // CADASTRO NO REALTIME DATABASE
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (formData.senha !== formData.confirmarSenha) {
      alert('As senhas não coincidem. Por favor, verifique novamente.');
      return;
    }

    if (formData.senha.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    try {
      setLoading(true);
      const emailTratado = formData.email.toLowerCase().trim();

      // Verifica se o e-mail já existe
      const usuariosRef = ref(db, 'usuarios');
      const emailQuery = query(usuariosRef, orderByChild('email'), equalTo(emailTratado));
      const snapshot = await get(emailQuery);

      if (snapshot.exists()) {
        alert('Este e-mail já está cadastrado. Tente fazer login.');
        return;
      }

      // Cria um novo registro no Realtime Database (Gera chave única com push)
      const novoUsuarioRef = push(usuariosRef);
      const novoUsuario = {
        nomeCompleto: formData.nomeCompleto.trim(),
        telefone: formData.telefone.trim(),
        email: emailTratado,
        dataNascimento: formData.dataNascimento,
        senha: formData.senha,
        criadoEm: new Date().toISOString()
      };

      await set(novoUsuarioRef, novoUsuario);

      alert(`Cadastro realizado com sucesso, ${formData.nomeCompleto}!`);
      setShowRegisterModal(false);
      if (onLoginSuccess) onLoginSuccess({ id: novoUsuarioRef.key, ...novoUsuario });

      // Limpa os campos do formulário
      setFormData({
        nomeCompleto: '',
        telefone: '',
        email: '',
        dataNascimento: '',
        senha: '',
        confirmarSenha: ''
      });
    } catch (error) {
      console.error('Erro ao salvar no Realtime Database:', error);
      alert('Ocorreu um erro ao cadastrar no Realtime Database.');
    } finally {
      setLoading(false);
    }
  };

  const openRegisterFromLogin = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  if (!showLoginModal && !showRegisterModal) return null;

  return (
    <>
      {/* ================= MODAL DE LOGIN ================= */}
      {showLoginModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <button className="modal-close-btn" onClick={() => setShowLoginModal(false)}>✕</button>
            <h3 className="modal-title">Acessar Conta</h3>

            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="form-group">
                <label>E-mail</label>
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Senha</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>

              <div className="form-links">
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => alert('Em breve: recuperação de senha por e-mail.')}
                >
                  Esqueci minha senha
                </button>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Acessando...' : 'Entrar'}
              </button>

              <div className="form-footer-switch">
                Não tem uma conta?{' '}
                <button type="button" className="link-btn highlight" onClick={openRegisterFromLogin}>
                  Cadastre-se
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL DE CADASTRO ================= */}
      {showRegisterModal && (
        <div className="modal-backdrop">
          <div className="modal-card register-card">
            <button className="modal-close-btn" onClick={() => setShowRegisterModal(false)}>✕</button>
            <h3 className="modal-title">Novo Cadastro</h3>
            <p className="modal-subtitle">Preencha seus dados para solicitar serviços rapidamente</p>

            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <div className="form-group">
                <label>Nome Completo</label>
                <input
                  type="text"
                  name="nomeCompleto"
                  required
                  placeholder="Ex: João da Silva"
                  value={formData.nomeCompleto}
                  onChange={handleRegisterChange}
                />
              </div>

              <div className="form-group">
                <label>Telefone / WhatsApp</label>
                <input
                  type="tel"
                  name="telefone"
                  required
                  placeholder="(17) 99999-9999"
                  value={formData.telefone}
                  onChange={handleRegisterChange}
                />
              </div>

              <div className="form-group">
                <label>E-mail</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleRegisterChange}
                />
              </div>

              <div className="form-group">
                <label>Data de Nascimento</label>
                <input
                  type="date"
                  name="dataNascimento"
                  required
                  value={formData.dataNascimento}
                  onChange={handleRegisterChange}
                />
              </div>

              <div className="form-group">
                <label>Senha</label>
                <input
                  type="password"
                  name="senha"
                  required
                  placeholder="Mínimo de 6 caracteres"
                  value={formData.senha}
                  onChange={handleRegisterChange}
                />
              </div>

              <div className="form-group">
                <label>Confirmar Senha</label>
                <input
                  type="password"
                  name="confirmarSenha"
                  required
                  placeholder="Repita a senha criada"
                  value={formData.confirmarSenha}
                  onChange={handleRegisterChange}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="auth-cancel-btn"
                  onClick={() => setShowRegisterModal(false)}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}