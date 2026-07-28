// src/components/features/RequestServiceModal.jsx
import React, { useState, useEffect } from 'react';
import './RequestServiceModal.css';
import { db, storage } from '../../services/firebase';
import { ref, push, set } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import OtherServicesModal from './OtherServicesModal';

export default function RequestServiceModal({ isOpen, onClose, onSubmitSuccess, userEmail }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showOtherModal, setShowOtherModal] = useState(false);
 
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setServicosSelecionados([]);
      setImagens([]);
      setPreviews([]);
    }
  }, [isOpen]);

  // ETAPA 1
  const [imovel, setImovel] = useState('Residencial');
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  const [bairro, setBairro] = useState('');
  const [urgencia, setUrgencia] = useState('Normal');
  const [descricao, setDescricao] = useState('');
  
  // Estados para gerenciar até 3 fotos no agendamento
  const [imagens, setImagens] = useState([]);
  const [previews, setPreviews] = useState([]);

  // ETAPA 2
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [periodoSelecionado, setPeriodoSelecionado] = useState('');

  const listaServicos = [
    { id: 'chuveiro', label: 'Instalação/Troca de Chuveiro', icon: '🚿' },
    { id: 'ventilador', label: 'Instalação de Ventilador', icon: '🌀' },
    { id: 'quadro', label: 'Manutenção de Quadro/Padrão', icon: '⚡' },
    { id: 'iluminacao', label: 'Lustres, Luminárias e LED', icon: '💡' },
    { id: 'tomadas', label: 'Troca de Tomadas/Interruptores', icon: '🔌' },
    { id: 'manutencao', label: 'Reparo de Curto-Circuito', icon: '🛠️' },
  ];

  const gerarProximosDias = () => {
    const dias = [];
    const hoje = new Date();
    for (let i = 1; i <= 5; i++) {
      const proximaData = new Date();
      proximaData.setDate(hoje.getDate() + i);
      
      const diaSemana = proximaData.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      const diaMes = proximaData.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const isoString = proximaData.toISOString().split('T')[0];

      dias.push({ label: `${diaSemana.toUpperCase()}, ${diaMes}`, value: isoString });
    }
    return dias;
  };

  const diasDisponiveis = gerarProximosDias();

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

  // Gerenciamento seguro de até 3 fotos
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
    if (!dataSelecionada || !periodoSelecionado) {
      alert('Por favor, selecione o dia e o período da visita.');
      return;
    }

    try {
      setLoading(true);
      const emailTratado = userEmail ? String(userEmail).trim().toLowerCase() : '';

      // 1. Upload das fotos para o Firebase Storage
      const urlsFotos = [];
      for (let i = 0; i < imagens.length; i++) {
        const file = imagens[i];
        const nomeArquivo = `agendamentos/${Date.now()}_${i}_${file.name}`;
        const arquivoRef = storageRef(storage, nomeArquivo);
        
        await uploadBytes(arquivoRef, file);
        const downloadUrl = await getDownloadURL(arquivoRef);
        urlsFotos.push(downloadUrl);
      }

      // 2. Monta o objeto completo com as URLs das fotos
      const serviceData = {
        tipo: 'Solicitação de Serviço Agendado',
        email: emailTratado,
        imovel,
        servicos: servicosSelecionados,
        bairro,
        urgencia,
        descricao,
        fotos: urlsFotos, // Array de URLs das fotos salvas no Storage
        dataAgendamento: dataSelecionada,
        periodo: periodoSelecionado,
        status: 'Pendente',
        criadoEm: new Date().toISOString()
      };

      const servicosRef = ref(db, 'servicos_agendados');
      const novoServicoRef = push(servicosRef);
      await set(novoServicoRef, serviceData);

      alert(`Serviço agendado com sucesso! Código do Agendamento: ${novoServicoRef.key}`);
      if (onSubmitSuccess) onSubmitSuccess({ id: novoServicoRef.key, ...serviceData });

      // Limpeza de campos
      setServicosSelecionados([]);
      setBairro('');
      setDescricao('');
      setDataSelecionada('');
      setPeriodoSelecionado('');
      setImagens([]);
      setPreviews([]);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar agendamento no Realtime Database:', error);
      alert('Ocorreu um erro ao agendar o serviço. Tente novamente.');
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

          <h3 className="modal-title-service">Solicitar Serviço Agendado</h3>
          <p className="modal-subtitle-service">
            Passo {step} de 2 &bull; {step === 1 ? 'Preencha os dados do serviço' : 'Escolha a Data e Horário'}
          </p>

          <form onSubmit={handleSubmit} className="service-form">
            {step === 1 && (
              <div className="step-container">
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
                  <label className="section-label">2. Qual serviço você precisa?</label>
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
                  <label className="section-label">3. Bairro / Localidade *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Centro, Bairro São José..."
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="section-label">4. Urgência do Atendimento</label>
                  <select value={urgencia} onChange={(e) => setUrgencia(e.target.value)}>
                    <option value="Normal">🟢 Normal - Agendamento Padrão</option>
                    <option value="Pouca Urgência">🟡 Próximos dias</option>
                    <option value="Urgente">🔴 Urgente - Sem energia / Risco elétrico</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="section-label">5. Descrição / Observações</label>
                  <textarea
                    rows="2"
                    placeholder="Ex: Trazer escada alta, disjuntor de 50A..."
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="section-label">6. Fotos do Local/Quadro (Máximo 3 fotos)</label>
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
                  type="button"
                  className="btn-submit-service"
                  onClick={() => setStep(2)}
                  disabled={servicosSelecionados.length === 0 || !bairro.trim()}
                >
                  Avançar para Escolher Data e Hora ➔
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="step-container">
                <div className="form-group">
                  <label className="section-label">📅 Selecione o Dia do Atendimento</label>
                  <div className="date-chips-grid">
                    {diasDisponiveis.map((dia) => (
                      <div
                        key={dia.value}
                        className={`date-chip ${dataSelecionada === dia.value ? 'selected' : ''}`}
                        onClick={() => setDataSelecionada(dia.value)}
                      >
                        <span className="chip-text">{dia.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="section-label">⏰ Período Preferencial</label>
                  <div className="time-slots-grid">
                    {[
                      { id: 'manha', title: 'Manhã', hora: '08:00 às 12:00', icon: '🌅' },
                      { id: 'tarde', title: 'Tarde', hora: '13:00 às 18:00', icon: '☀️' },
                      { id: 'noite', title: 'Noite / Emergência', hora: '18:30 às 21:00', icon: '🌙' },
                    ].map((slot) => (
                      <div
                        key={slot.id}
                        className={`time-slot-card ${periodoSelecionado === slot.title ? 'selected' : ''}`}
                        onClick={() => setPeriodoSelecionado(slot.title)}
                      >
                        <span className="slot-icon">{slot.icon}</span>
                        <div className="slot-info">
                          <strong>{slot.title}</strong>
                          <span>{slot.hora}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="modal-actions-service">
                  <button type="button" className="btn-back" onClick={() => setStep(1)} disabled={loading}>
                    ⬅ Voltar
                  </button>
                  <button 
                    type="submit" 
                    className="btn-submit-service"
                    disabled={!dataSelecionada || !periodoSelecionado || loading}
                  >
                    {loading ? 'Enviando Fotos e Agendando...' : 'Finalizar Agendamento 🚀'}
                  </button>
                </div>
              </div>
            )}
          </form>
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