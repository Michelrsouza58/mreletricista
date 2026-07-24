import React, { useState } from 'react';
import './Home.css';
import banner from '../assets/cartao-mr-eletricista.jpg';

// Importação dos Modais Independentes
import AuthModals from '../components/auth/AuthModals';
import RequestBudgetModal from '../components/features/RequestBudgetModal';
import RequestServiceModal from '../components/features/RequestServiceModal';

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);

  // Estados dos Modais de Autenticação
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Estado do Modal de Orçamento (Direto)
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  // Estado do Modal de Serviço Agendado (Completo: Dados + Data/Hora)
  const [showServiceModal, setShowServiceModal] = useState(false);

  // Callback ao realizar Login/Cadastro
  const handleLoginSuccess = (userData) => {
    setIsLogged(true);
    setUser(userData);
  };

  // Callback de Logout
  const handleLogout = () => {
    setIsLogged(false);
    setUser(null);
    setMenuOpen(false);
  };

  return (
    <div className="home-main-wrapper">
      {/* Imagem de Fundo e Overlay Escuro */}
      <div 
        className="bg-background-image" 
        style={{ backgroundImage: `url(${banner})` }} 
      />
      <div className="bg-overlay-gradient" />

      {/* HEADER FIXO NO TOPO */}
      <header className="navbar-fixed">
        <div className="logo-container">
          <span className="brand-mr">MR</span>
          <span className="brand-eletricista">ELETRICISTA</span>
        </div>

        {/* ÁREA DE PERFIL / MENU DROPDOWN */}
        <div className="user-profile-wrapper">
          <button 
            className="user-avatar-btn" 
            onClick={() => setMenuOpen(!menuOpen)}
            title="Menu do Perfil"
          >
            👤
          </button>

          {menuOpen && (
            <div className="profile-dropdown">
              {isLogged ? (
                <>
                  <p className="user-greeting">
                    Olá, {user?.nome || user?.nomeCompleto || 'Cliente'}!
                  </p>
                  <button className="dropdown-item">Meus Pedidos</button>
                  <button className="dropdown-item" onClick={handleLogout}>Sair</button>
                </>
              ) : (
                <button 
                  className="dropdown-item highlight"
                  onClick={() => {
                    setMenuOpen(false);
                    setShowLoginModal(true);
                  }}
                >
                  Entrar / Cadastrar
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* CONTEÚDO HERO CENTRAL */}
      <main className="hero-content-container">
        <div className="hero-glass-card">
          <div className="badge-location">
            ⚡ Atendimento Profissional em José Bonifácio e Região
          </div>

          <h2 className="hero-title">Serviços Elétricos Rápidos e Seguros</h2>
          <p className="hero-subtitle">
            Solicite um orçamento instantâneo ou agende sua visita técnica presencial
          </p>

          <div className="cta-buttons-grid">
            {/* 1. SOLICITAR ORÇAMENTO (Apenas cotação rápida) */}
            <button 
              className="cta-btn primary-btn"
              onClick={() => setShowBudgetModal(true)}
            >
              <span className="btn-icon">📋</span>
              <span>Solicitar Orçamento</span>
            </button>

            {/* 2. SOLICITAR SERVIÇO (Dados do serviço + Agendamento de Data/Hora) */}
            <button 
              className="cta-btn secondary-btn"
              onClick={() => setShowServiceModal(true)}
            >
              <span className="btn-icon">⚡</span>
              <span>Solicitar Serviço</span>
            </button>

            {/* 3. CONSULTAR PEDIDO */}
            <button 
              className="cta-btn outline-btn"
              onClick={() => {
                if (!isLogged) {
                  setShowLoginModal(true);
                } else {
                  alert('Carregando seus pedidos...');
                }
              }}
            >
              <span className="btn-icon">🔍</span>
              <span>Consultar Pedido</span>
            </button>
          </div>

          <div className="quick-contacts-bar">
            <a 
              href="https://wa.me/5517991640310" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="contact-link"
            >
              📱 (17) 99164-0310
            </a>
            <span className="divider">•</span>
            <a 
              href="https://instagram.com/michelrobertoeletricista" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="contact-link"
            >
              📷 @michelrobertoeletricista
            </a>
          </div>
        </div>
      </main>

      {/* ==========================================
          GERENCIAMENTO DOS MODAIS
          ========================================== */}

      {/* Modais de Autenticação */}
      <AuthModals
        showLoginModal={showLoginModal}
        setShowLoginModal={setShowLoginModal}
        showRegisterModal={showRegisterModal}
        setShowRegisterModal={setShowRegisterModal}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Modal 1: Solicitar Orçamento (Formulário Direto) */}
      <RequestBudgetModal
        isOpen={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        onSubmitSuccess={(dados) => {
          console.log('Orçamento salvo:', dados);
        }}
      />

      {/* Modal 2: Solicitar Serviço Agendado (Passo 1: Dados -> Passo 2: Data/Hora) */}
      <RequestServiceModal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        onSubmitSuccess={(dados) => {
          console.log('Serviço Agendado salvo:', dados);
        }}
      />

      {/* RODAPÉ */}
      <footer className="footer-bar">
        Site criado por <a href="https://github.com/seuusuario" target="_blank" rel="noopener noreferrer">Michel Roberto</a> &mdash; 2026
      </footer>
    </div>
  );
}

export default Home;