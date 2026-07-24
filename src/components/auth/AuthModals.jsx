// src/components/auth/AuthModals.jsx
import React, { useState } from 'react';
import './AuthModals.css';

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

  // Estados para Cadastro (Nome Completo, Telefone, Email, Data de Nascimento)
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    telefone: '',
    email: '',
    dataNascimento: ''
  });

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // Aqui entra a integração futura com o Firebase Auth
    alert(`Login efetuado com: ${loginEmail}`);
    setShowLoginModal(false);
    if (onLoginSuccess) onLoginSuccess({ email: loginEmail });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    // Aqui entra o salvamento no Firebase Firestore
    alert(`Cadastro realizado para: ${formData.nomeCompleto}`);
    setShowRegisterModal(false);
    if (onLoginSuccess) onLoginSuccess({ nome: formData.nomeCompleto, email: formData.email });
  };

  const openRegisterFromLogin = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  if (!showLoginModal && !showRegisterModal) return null;

  return (
    <>
      {/* MODAL DE LOGIN */}
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

              <button type="submit" className="auth-submit-btn">
                Entrar
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

      {/* MODAL / TELA DE OVERLAY DE CADASTRO */}
      {showRegisterModal && (
        <div className="modal-backdrop">
          <div className="modal-card register-card">
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

              <div className="modal-actions">
                <button
                  type="button"
                  className="auth-cancel-btn"
                  onClick={() => setShowRegisterModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="auth-submit-btn">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}