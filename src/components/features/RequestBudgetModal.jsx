// src/components/features/RequestBudgetModal.jsx
import React, { useState } from 'react';
import './RequestServiceModal.css';
import { db } from '../../services/firebase';
import { ref, push, set } from 'firebase/database';
import OtherServicesModal from './OtherServicesModal'; // Importando o modal de outros serviços

export default function RequestBudgetModal({ isOpen, onClose, onSubmitSuccess, userEmail }) {
  const [imovel, setImovel] = useState('Residencial');
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  const [urgencia, setUrgencia] = useState('Normal');
  const [bairro, setBairro] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagem, setImagem] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtherModal, setShowOtherModal] = useState(false); // Estado para abrir o sub-modal

  const listaServicosFixos = [
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

  // Função para receber o item escolhido lá do sub-modal de Outros
  const handleAddOtherService = (servicoFormatado) => {
    setServicosSelecionados([...servicosSelecionados, servicoFormatado]);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagem(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (servicosSelecionados.length === 0) {
      alert('Por favor, selecione ao menos um tipo de serviço.');
      return;
    }

    try {
      setLoading(true);

      const emailTratado = userEmail ? String(userEmail).trim().toLowerCase() : '';

      const budgetData = {
        tipo: 'Solicitação de Orçamento',
        email: emailTratado,
        imovel,
        servicos: servicosSelecionados,
        urgencia,
        bairro,
        descricao,
        status: 'Pendente',
        criadoEm: new Date().toISOString()
      };

      const orcamentosRef = ref(db, 'orcamentos');
      const novoOrcamentoRef = push(orcamentosRef);
      await set(novoOrcamentoRef, budgetData);

      alert(`Solicitação enviada com sucesso! Código do Orçamento: ${novoOrcamentoRef.key}`);
      if (onSubmitSuccess) onSubmitSuccess({ id: novoOrcamentoRef.key, ...budgetData });
      
      // Limpeza de campos e fechamento
      setServicosSelecionados([]);
      setBairro('');
      setDescricao('');
      setPreviewUrl('');
      onClose();
    } catch (error) {
      console.error('Erro ao salvar orçamento no Realtime Database:', error);
      alert('Ocorreu um erro ao enviar a solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
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
                {listaServicosFixos.map((serv) => {
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

                {/* BOTÃO PARA ABRIR O MODAL DE OUTROS SERVIÇOS ESPECIALIZADOS */}
                <div
                  className={`service-card-option ${servicosSelecionados.some(s => s.startsWith('Especializado:')) ? 'selected' : ''}`}
                  onClick={() => setShowOtherModal(true)}
                >
                  <span className="card-icon">🔧</span>
                  <span className="card-label">Outros (Encanamento, Segurança, Automação...)</span>
                </div>
              </div>

              {/* Exibe os itens especializados adicionados */}
              {servicosSelecionados.filter(s => s.startsWith('Especializado:')).length > 0 && (
                <div style={{ marginTop: '10px', fontSize: '13px', color: '#f2c94c' }}>
                  <strong>Itens especializados selecionados:</strong>
                  <ul>
                    {servicosSelecionados.filter(s => s.startsWith('Especializado:')).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="section-label">3. Bairro / Localidade (José Bonifácio e Região)</label>
              <input
                type="text"
                required
                placeholder="Ex: Centro, Bairro São José..."
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="section-label">4. Urgência do Orçamento</label>
              <select value={urgencia} onChange={(e) => setUrgencia(e.target.value)}>
                <option value="Normal">🟢 Normal - Pesquisando preços</option>
                <option value="Pouca Urgência">🟡 Próximos dias</option>
                <option value="Urgente">🔴 Urgente - Problema grave</option>
              </select>
            </div>

            <div className="form-group">
              <label className="section-label">5. Descrição detalhada do problema</label>
              <textarea
                rows="2"
                placeholder="Descreva brevemente o que precisa ser feito..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="section-label">6. Foto do Local/Quadro (Opcional)</label>
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
              disabled={servicosSelecionados.length === 0 || !bairro.trim() || loading}
            >
              {loading ? 'Enviando...' : 'Enviar Pedido de Orçamento 🚀'}
            </button>
          </form>
        </div>
      </div>

      {/* Modal de Outros Serviços Especializados Reutilizável */}
      <OtherServicesModal
        isOpen={showOtherModal}
        onClose={() => setShowOtherModal(false)}
        onSelectOtherService={handleAddOtherService}
      />
    </>
  );
}