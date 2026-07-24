// src/components/features/RequestBudgetModal.jsx
import React, { useState } from 'react';
import './RequestServiceModal.css';

export default function RequestBudgetModal({ isOpen, onClose, onSubmitSuccess }) {
  const [imovel, setImovel] = useState('Residencial');
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  const [urgencia, setUrgencia] = useState('Normal');
  const [bairro, setBairro] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagem, setImagem] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const listaServicos = [
    { id: 'chuveiro', label: 'Chuveiro / Torneira Elétrica', icon: '🚿' },
    { id: 'ventilador', label: 'Ventilador de Teto / Parede', icon: '🌀' },
    { id: 'quadro', label: 'Quadro de Disjuntores / Padrão', icon: '⚡' },
    { id: 'iluminacao', label: 'Luminárias / Pendentes / LED', icon: '💡' },
    { id: 'tomadas', label: 'Tomadas e Interruptores', icon: '🔌' },
    { id: 'manutencao', label: 'Curto-Circuito / Manutenção', icon: '🛠️' },
  ];

  const handleToggleServico = (label) => {
    if (servicosSelecionados.includes(label)) {
      setServicosSelecionados(servicosSelecionados.filter((s) => s !== label));
    } else {
      setServicosSelecionados([...servicosSelecionados, label]);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagem(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (servicosSelecionados.length === 0) {
      alert('Por favor, selecione ao menos um tipo de serviço.');
      return;
    }

    const budgetData = {
      tipo: 'Solicitação de Orçamento',
      imovel,
      servicos: servicosSelecionados,
      urgencia,
      bairro,
      descricao,
      imagem,
      dataCriacao: new Date()
    };

    alert('Solicitação de orçamento enviada com sucesso! Entraremos em contato em breve.');
    if (onSubmitSuccess) onSubmitSuccess(budgetData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-service">
      <div className="modal-card-service">
        <button className="modal-close-btn" onClick={onClose}>✕</button>

        <h3 className="modal-title-service">Solicitar Orçamento</h3>
        <p className="modal-subtitle-service">Preencha os dados abaixo para receber sua cotação</p>

        <form onSubmit={handleSubmit} className="service-form">
          <div className="form-group">
            <label className="section-label">1. Tipo de Imóvel</label>
            <div className="radio-group-imovel">
              {['Residencial', 'Comercial', 'Chácara / Rural'].map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  className={`btn-option ${imovel === tipo ? 'selected' : ''}`}
                  onClick={() => setImovel(tipo)}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="section-label">2. Quais itens precisam de orçamento?</label>
            <div className="services-grid-select">
              {listaServicos.map((serv) => {
                const isSelected = servicosSelecionados.includes(serv.label);
                return (
                  <div
                    key={serv.id}
                    className={`service-card-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggleServico(serv.label)}
                  >
                    <span className="card-icon">{serv.icon}</span>
                    <span className="card-label">{serv.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label>Bairro / Localidade (José Bonifácio e Região)</label>
            <input
              type="text"
              required
              placeholder="Ex: Centro, Bairro São José..."
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Urgência do Orçamento</label>
            <select value={urgencia} onChange={(e) => setUrgencia(e.target.value)}>
              <option value="Normal">🟢 Normal - Pesquisando preços</option>
              <option value="Pouca Urgência">🟡 Próximos dias</option>
              <option value="Urgente">🔴 Urgente - Problema grave</option>
            </select>
          </div>

          <div className="form-group">
            <label>Descrição detalhada do problema</label>
            <textarea
              rows="2"
              placeholder="Descreva brevemente o que precisa ser feito..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Foto do Local/Quadro (Opcional)</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="file-input" />
            {previewUrl && (
              <div className="image-preview">
                <img src={previewUrl} alt="Preview do local" />
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn-submit-service"
            disabled={servicosSelecionados.length === 0 || !bairro}
          >
            Enviar Pedido de Orçamento 🚀
          </button>
        </form>
      </div>
    </div>
  );
}