import React, { useState } from 'react';
import './Home.css';
import banner from '../assets/cartao-mr-eletricista.jpg';

// Imagens dos Patrocinadores
import patrocinadorEsq from '../assets/multlar.png';
import patrocinadorDir from '../assets/takau.png';

// Modais
import AuthModals from '../components/auth/AuthModals';
import RequestBudgetModal from '../components/features/RequestBudgetModal';
import RequestServiceModal from '../components/features/RequestServiceModal';
import MyRequestsModal from '../components/features/MyRequestsModal';

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);

  const handleLoginSuccess = (userData) => {
    setIsLogged(true);
    setUser(userData);
  };

  const handleLogout = () => {
    setIsLogged(false);
    setUser(null);
    setMenuOpen(false);
  };

  const handleOpenMyRequests = () => {
    setMenuOpen(false);
    setShowRequestsModal(true);
  };

  return (
    <div className="home-main-wrapper">
      {/* Imagem de Fundo e Overlay Escuro */}
      <div 
        className="bg-background-image" 
        style={{ backgroundImage: `url(${banner})` }} 
      />
      <div className="bg-overlay-gradient" />

      {/* HEADER ÚNICO COM PATROCINADORES E LOGO CENTRAL */}
      <header className="navbar-scroll-sponsor">
        {/* Patrocinador Esquerda */}
        <div className="sponsor-box left">
          <img src={patrocinadorEsq} alt="Patrocinador Esquerda" className="sponsor-img" />
        </div>

        {/* Logo Único MR Eletricista no Centro */}
        <div className="logo-container-large">
          <span className="brand-mr-large">MR</span>
          <span className="brand-eletricista-large">ELETRICISTA</span>
        </div>

        {/* Patrocinador Direita + Avatar Perfil */}
        <div className="sponsor-box right">
          <img src={patrocinadorDir} alt="Patrocinador Takau" className="sponsor-img" />

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
                    <button className="dropdown-item" onClick={handleOpenMyRequests}>
                      Meus Pedidos
                    </button>
                    <button className="dropdown-item" onClick={handleLogout}>
                      Sair
                    </button>
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
            <button 
              className="cta-btn primary-btn"
              onClick={() => setShowBudgetModal(true)}
            >
              <span className="btn-icon">📋</span>
              <span>Solicitar Orçamento</span>
            </button>

            <button 
              className="cta-btn secondary-btn"
              onClick={() => setShowServiceModal(true)}
            >
              <span className="btn-icon">⚡</span>
              <span>Solicitar Serviço</span>
            </button>

            <button 
              className="cta-btn outline-btn"
              onClick={() => setShowRequestsModal(true)}
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

      {/* MODAIS */}
      <AuthModals
        showLoginModal={showLoginModal}
        setShowLoginModal={setShowLoginModal}
        showRegisterModal={showRegisterModal}
        setShowRegisterModal={setShowRegisterModal}
        onLoginSuccess={handleLoginSuccess}
      />

      <RequestBudgetModal
        isOpen={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        userEmail={user?.email}
        onSubmitSuccess={(dados) => console.log('Orçamento salvo:', dados)}
      />

      <RequestServiceModal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        userEmail={user?.email}
        onSubmitSuccess={(dados) => console.log('Serviço Agendado salvo:', dados)}
      />

      <MyRequestsModal
        isOpen={showRequestsModal}
        onClose={() => setShowRequestsModal(false)}
        userEmail={user?.email}
      />

      {/* RODAPÉ */}
      <footer className="footer-bar">
        Site criado por <a href="https://github.com/seuusuario" target="_blank" rel="noopener noreferrer">Michel Roberto</a> &mdash; 2026
      </footer>
    </div>
  );
}

export default Home;