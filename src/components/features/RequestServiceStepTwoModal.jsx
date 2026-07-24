// src/components/features/RequestServiceStepTwoModal.jsx
import React, { useState } from 'react';
import './RequestServiceStepTwoModal.css';

export default function RequestServiceStepTwoModal({ 
  isOpen, 
  onClose, 
  onBack, 
  onSubmitSuccess, 
  dadosEtapaAnterior = {} 
}) {
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [periodoSelecionado, setPeriodoSelecionado] = useState('');

  // Gerador dinâmico dos próximos 5 dias para os cards interativos
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

  const handleFinalize = (e) => {
    e.preventDefault();
    if (!dataSelecionada || !periodoSelecionado) {
      alert('Por favor, selecione o dia e o período do atendimento.');
      return;
    }

    // Une os dados da primeira etapa com a data e hora selecionadas
    const agendamentoCompleto = {
      ...dadosEtapaAnterior,
      dataAgendamento: dataSelecionada,
      periodo: periodoSelecionado,
      dataFinalizacao: new Date()
    };

    alert('Serviço agendado com sucesso! Entraremos em contato para confirmar a visita.');
    if (onSubmitSuccess) onSubmitSuccess(agendamentoCompleto);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-schedule">
      <div className="modal-card-schedule">
        <button className="modal-close-btn" onClick={onClose}>✕</button>

        <h3 className="modal-title-schedule">Agendar Data e Hora</h3>
        <p className="modal-subtitle-schedule">Escolha o melhor momento para o atendimento presencial</p>

        <form onSubmit={handleFinalize} className="schedule-form">
          {/* SELEÇÃO DO DIA DA SEMANA */}
          <div className="step-section">
            <label className="section-label">📅 1. Selecione o Dia</label>
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

          {/* SELEÇÃO DO PERÍODO/HORÁRIO */}
          <div className="step-section">
            <label className="section-label">⏰ 2. Selecione o Período</label>
            <div className="time-slots-grid">
              {[
                { id: 'manha', title: 'Manhã', hora: '08:00 às 12:00', icon: '🌅' },
                { id: 'tarde', title: 'Tarde', hora: '13:00 às 18:00', icon: '☀️' },
                { id: 'noite', title: 'Noite (Emergência)', hora: '18:30 às 21:00', icon: '🌙' },
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

          {/* BOTÕES DE AÇÃO */}
          <div className="modal-actions-schedule">
            {onBack && (
              <button type="button" className="btn-back" onClick={onBack}>
                ⬅ Voltar
              </button>
            )}
            <button 
              type="submit" 
              className="btn-submit-schedule"
              disabled={!dataSelecionada || !periodoSelecionado}
            >
              Confirmar e Agendar 🚀
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}