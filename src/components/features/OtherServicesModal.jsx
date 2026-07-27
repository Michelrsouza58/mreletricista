// src/components/features/OtherServicesModal.jsx
import React, { useState } from 'react';
import './RequestServiceModal.css';

export default function OtherServicesModal({ isOpen, onClose, onSelectOtherService }) {
  const [categoriaEscolhida, setCategoriaEscolhida] = useState('Encanamento / Hidráulica');
  const [descricaoDetalhada, setDescricaoDetalhada] = useState('');

  const subCategorias = [
    { id: 'encanamento', label: 'Encanamento / Hidráulica', icon: '🚰' },
    { id: 'seguranca', label: 'Segurança Eletrônica (Câmeras / Alarme)', icon: '📷' },
    { id: 'automacao', label: 'Automação Residencial / IoT', icon: '🏠' },
    { id: 'outro_geral', label: 'Outro Serviço Específico', icon: '🔧' },
  ];

  const handleConfirmar = (e) => {
    e.preventDefault();
    if (!descricaoDetalhada.trim()) {
      alert('Por favor, descreva detalhadamente o serviço necessário.');
      return;
    }

    const servicoFormatado = `Especializado: ${categoriaEscolhida} - ${descricaoDetalhada.trim()}`;
    onSelectOtherService(servicoFormatado);
    
    setDescricaoDetalhada('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-service">
      <div className="modal-card-service">
        <button className="modal-close-btn" onClick={onClose}>✕</button>

        <h3 className="modal-title-service">Outros Serviços Especializados</h3>
        <p className="modal-subtitle-service">Selecione a área e descreva o que você precisa</p>

        <form onSubmit={handleConfirmar} className="service-form">
          <div className="form-group">
            <label className="section-label">1. Escolha a Categoria</label>
            <div className="services-grid-select">
              {subCategorias.map((cat) => {
                const isSelected = categoriaEscolhida === cat.label;
                return (
                  <div
                    key={cat.id}
                    className={`service-card-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => setCategoriaEscolhida(cat.label)}
                  >
                    <span className="card-icon">{cat.icon}</span>
                    <span className="card-label">{cat.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label className="section-label">2. Descreva o Serviço *</label>
            <textarea
              rows="3"
              required
              placeholder="Ex: Instalação de 3 câmeras Intelbras com DVR ou vazamento no cano da pia..."
              value={descricaoDetalhada}
              onChange={(e) => setDescricaoDetalhada(e.target.value)}
            />
          </div>

          <div className="modal-actions-service" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button type="button" className="btn-back" onClick={onClose} style={{ flex: 1 }}>
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-submit-service"
              style={{ flex: 1, margin: 0 }}
              disabled={!descricaoDetalhada.trim()}
            >
              Confirmar e Adicionar ➔
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}