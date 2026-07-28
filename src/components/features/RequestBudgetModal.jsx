// src/components/features/RequestBudgetModal.jsx
import React, { useState, useEffect } from 'react';
import './RequestServiceModal.css';
import { db, storage } from '../../services/firebase';
import { ref, push, set } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import OtherServicesModal from './OtherServicesModal';

export default function RequestBudgetModal({ isOpen, onClose, onSubmitSuccess, userEmail, onOpenLogin }) {
  const [imovel, setImovel] = useState('Residencial');
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  const [urgencia, setUrgencia] = useState('Normal');
  const [bairro, setBairro] = useState('');
  const [descricao, setDescricao] = useState('');
  
  const [imagens, setImagens] = useState([]);
  const [previews, setPreviews] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [showOtherModal, setShowOtherModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setImovel('Residencial');
      setServicosSelecionados([]);
      setUrgencia('Normal');
      setBairro('');
      setDescricao('');
      setImagens([]);
      setPreviews([]);
    }
  }, [isOpen]);

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

  const handleAddOtherService = (servicoFormatado) => {
    setServicosSelecionados([...servicosSelecionados, servicoFormatado]);
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setImagens((prevImagens) => {
      const combinadas = [...prevImagens, ...files].slice(0, 3);
      const novasPreviews = combinadas.map((file) => URL.createObjectURL(file));
      setPreviews(novasPreviews);
      return combinadas;
    });

    e.target.value = null;
  };

  const handleRemoveImage = (index) => {
    const novasImagens = imagens.filter((_, i) => i !== index);
    const novasPreviews = previews.filter((_, i) => i !== index);
    setImagens(novasImagens);
    setPreviews(novasPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userEmail) {
      alert('Você precisa estar logado para solicitar um orçamento.');
      return;
    }

    if (servicosSelecionados.length === 0) {
      alert('Por favor, selecione ao menos um tipo de serviço.');
      return;
    }

    try {
      setLoading(true);
      const emailTratado = String(userEmail).trim().toLowerCase();

      const urlsFotos = [];
      for (let i = 0; i < imagens.length; i++) {
        const file = imagens[i];
        const nomeArquivo = `orcamentos/${Date.now()}_${i}_${file.name}`;
        const arquivoRef = storageRef(storage, nomeArquivo);
        
        await uploadBytes(arquivoRef, file);
        const downloadUrl = await getDownloadURL(arquivoRef);
        urlsFotos.push(downloadUrl);
      }

      const budgetData = {
        tipo: 'Solicitação de Orçamento',
        email: emailTratado,
        imovel,
        servicos: servicosSelecionados,
        urgencia,
        bairro,
        descricao,
        fotos: urlsFotos,
        status: 'Pendente',
        criadoEm: new Date().toISOString()
      };

      const orcamentosRef = ref(db, 'orcamentos');
      const novoOrcamentoRef = push(orcamentosRef);
      await set(novoOrcamentoRef, budgetData);

      alert(`Solicitação enviada com sucesso! Código do Orçamento: ${novoOrcamentoRef.key}`);
      if (onSubmitSuccess) onSubmitSuccess({ id: novoOrcamentoRef.key, ...budgetData });
      
      setServicosSelecionados([]);
      setBairro('');
      setDescricao('');
      setImagens([]);
      setPreviews([]);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar orçamento e fotos:', error);
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

          {!userEmail ? (
            <div className="requests-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '30px 0' }}>
              <span className="empty-icon" style={{ fontSize: '2.5rem' }}>🔒</span>
              <p style={{ textAlign: 'center', color: '#d1d5db' }}>Você precisa estar logado para solicitar um orçamento.</p>
              <button 
                type="button"
                className="dropdown-item highlight"
                style={{
                  background: '#f2c94c',
                  color: '#0c2340',
                  fontWeight: 'bold',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  boxShadow: '0 4px 12px rgba(242, 201, 76, 0.3)'
                }}
                onClick={() => {
                  onClose();
                  if (onOpenLogin) onOpenLogin();
                }}
              >
                Entrar / Cadastrar ➔
              </button>
            </div>
          ) : (
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

                  <div
                    className={`service-card-option ${servicosSelecionados.some(s => s.startsWith('Especializado:')) ? 'selected' : ''}`}
                    onClick={() => setShowOtherModal(true)}
                  >
                    <span className="card-icon">🔧</span>
                    <span className="card-label">Outros (Encanamento, Segurança, Automação...)</span>
                  </div>
                </div>

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
                <label className="section-label">6. Fotos do Local/Problema (Máximo 3 fotos)</label>
                {imagens.length < 3 && (
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={handleImagesChange} 
                    className="file-input" 
                  />
                )}
                
                {previews.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                    {previews.map((src, index) => (
                      <div key={index} style={{ position: 'relative', width: '70px', height: '70px' }}>
                        <img 
                          src={src} 
                          alt={`Preview ${index}`} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid #f2c94c' }} 
                        />
                        <button 
                          type="button" 
                          onClick={() => handleRemoveImage(index)}
                          style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '10px', cursor: 'pointer' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="btn-submit-service"
                disabled={servicosSelecionados.length === 0 || !bairro.trim() || loading}
              >
                {loading ? 'Enviando Fotos e Orçamento...' : 'Enviar Pedido de Orçamento 🚀'}
              </button>
            </form>
          )}
        </div>
      </div>

      <OtherServicesModal
        isOpen={showOtherModal}
        onClose={() => setShowOtherModal(false)}
        onSelectOtherService={handleAddOtherService}
      />
    </>
  ); 
}