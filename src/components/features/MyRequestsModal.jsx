// src/components/features/MyRequestsModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import './MyRequestsModal.css';
import { db } from '../../services/firebase';
import { ref, get } from 'firebase/database';

export default function MyRequestsModal({ isOpen, onClose, userEmail }) {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState('todos');

  const carregarSolicitacoes = useCallback(async () => {
    setLoading(true);
    const lista = [];

    try {
      const emailUsuario = userEmail ? userEmail.toLowerCase().trim() : null;

      // SE NÃO ESTIVER LOGADO, NÃO MOSTRA NADA
      if (!emailUsuario) {
        setSolicitacoes([]);
        setLoading(false);
        return;
      }

      // 1. Busca na subpasta de orçamentos
      const orcamentosRef = ref(db, 'orcamentos');
      const snapOrcamentos = await get(orcamentosRef);
      
      if (snapOrcamentos.exists()) {
        const data = snapOrcamentos.val();
        Object.keys(data).forEach((key) => {
          const item = data[key];
          if (item.email && item.email.toLowerCase().trim() === emailUsuario) {
            lista.push({ id: key, categoria: 'Orcamento', ...item });
          }
        });
      }

      // 2. Busca na subpasta de Serviços Agendados
      const servicosRef = ref(db, 'servicos_agendados');
      const snapServicos = await get(servicosRef);
      
      if (snapServicos.exists()) {
        const data = snapServicos.val();
        Object.keys(data).forEach((key) => {
          const item = data[key];
          if (item.email && item.email.toLowerCase().trim() === emailUsuario) {
            lista.push({ id: key, categoria: 'ServicoAgendado', ...item });
          }
        });
      }

      lista.sort((a, b) => new Date(b.criadoEm || 0) - new Date(a.criadoEm || 0));
      setSolicitacoes(lista);
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    if (isOpen) {
      carregarSolicitacoes();
    }
  }, [isOpen, carregarSolicitacoes]);

  const getStatusColorClass = (status) => {
    if (!status) return 'status-pendente';
    const s = status.toLowerCase();
    if (s.includes('cancelado')) return 'status-cancelado';
    if (s.includes('negociação') || s.includes('negociacao')) return 'status-negociacao';
    if (s.includes('execução') || s.includes('execucao') || s.includes('andamento')) return 'status-execucao';
    if (s.includes('finalizado') || s.includes('concluído') || s.includes('concluido')) return 'status-finalizado';
    return 'status-pendente';
  };

  if (!isOpen) return null;

  const solicitacoesFiltradas = solicitacoes.filter((item) => {
    if (filter === 'orcamentos') return item.categoria === 'Orcamento';
    if (filter === 'servicos') return item.categoria === 'ServicoAgendado';
    return true;
  });

  return (
    <div className="modal-backdrop-requests">
      <div className="modal-card-requests">
        <button className="modal-close-btn" onClick={onClose}>✕</button>

        <h3 className="modal-title-requests">Minhas Solicitações</h3>
        <p className="modal-subtitle-requests">
          Acompanhe o status e detalhes dos seus orçamentos e agendamentos
        </p>

        {!userEmail ? (
          <div className="requests-empty">
            <span className="empty-icon">🔒</span>
            <p>Você precisa estar logado para consultar seus pedidos.</p>
          </div>
        ) : (
          <>
            <div className="requests-filter-bar">
              <button
                className={`filter-btn ${filter === 'todos' ? 'active' : ''}`}
                onClick={() => setFilter('todos')}
              >
                Todos ({solicitacoes.length})
              </button>
              <button
                className={`filter-btn ${filter === 'orcamentos' ? 'active' : ''}`}
                onClick={() => setFilter('orcamentos')}
              >
                📋 Orçamentos
              </button>
              <button
                className={`filter-btn ${filter === 'servicos' ? 'active' : ''}`}
                onClick={() => setFilter('servicos')}
              >
                ⚡ Agendamentos
              </button>
            </div>

            {loading ? (
              <div className="requests-loading">Carregando suas solicitações...</div>
            ) : solicitacoesFiltradas.length === 0 ? (
              <div className="requests-empty">
                <span className="empty-icon">📂</span>
                <p>Nenhuma solicitação encontrada para o seu e-mail.</p>
              </div>
            ) : (
              <div className="requests-grid">
                {solicitacoesFiltradas.map((item) => {
                  const statusAtual = item.status || 'Pendente';
                  const statusColorClass = getStatusColorClass(statusAtual);

                  return (
                    <div
                      key={item.id}
                      className="request-summary-card"
                      onClick={() => setSelectedRequest(item)}
                      style={{ position: 'relative' }}
                    >
                      <div 
                        title={`Status: ${statusAtual}`}
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span style={{ fontSize: '11px', color: '#a0aec0', fontWeight: '500' }}>
                          {statusAtual}
                        </span>
                        <span 
                          className={`status-dot ${statusColorClass}`}
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            display: 'inline-block',
                            boxShadow: '0 0 4px rgba(0,0,0,0.3)'
                          }}
                        />
                      </div>

                      <div className="card-header-type" style={{ paddingRight: '80px' }}>
                        <span className={`badge-type ${item.categoria}`}>
                          {item.categoria === 'Orcamento' ? '📋 Orçamento' : '⚡ Agendamento'}
                        </span>
                      </div>

                      <div className="card-body-summary" style={{ marginTop: '8px' }}>
                        <strong className="summary-title">
                          {item.servicos ? item.servicos.join(', ') : 'Serviço Elétrico'}
                        </strong>
                        <p className="summary-info">📍 {item.bairro || 'José Bonifácio'}</p>
                        {item.dataAgendamento && (
                          <p className="summary-info">📅 Visita: {item.dataAgendamento} ({item.periodo})</p>
                        )}
                      </div>

                      <div className="card-footer-action">
                        <span>Ver detalhes completos ➔</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {selectedRequest && (
          <div className="detail-modal-overlay" onClick={() => setSelectedRequest(null)}>
            <div className="detail-modal-card" onClick={(e) => e.stopPropagation()}>
              <button className="detail-close-btn" onClick={() => setSelectedRequest(null)}>✕</button>

              <div className="detail-header">
                <span className={`badge-type ${selectedRequest.categoria}`}>
                  {selectedRequest.categoria === 'Orcamento' ? '📋 Orçamento' : '⚡ Agendamento'}
                </span>
                <h4>Código: #{selectedRequest.id.substring(0, 8)}</h4>
              </div>

              <div className="detail-body">
                <div className="detail-group">
                  <label>Status Atual</label>
                  <span className={`status-pill ${selectedRequest.status?.toLowerCase() || 'pendente'}`}>
                    {selectedRequest.status || 'Pendente'}
                  </span>
                </div>

                <div className="detail-group">
                  <label>Tipo de Imóvel</label>
                  <p>{selectedRequest.imovel || 'Não informado'}</p>
                </div>

                <div className="detail-group">
                  <label>Serviços Solicitados</label>
                  <ul>
                    {selectedRequest.servicos?.map((s, idx) => (
                      <li key={idx}>⚡ {s}</li>
                    ))}
                  </ul>
                </div>

                <div className="detail-group">
                  <label>Bairro / Localidade</label>
                  <p>{selectedRequest.bairro}</p>
                </div>

                <div className="detail-group">
                  <label>Urgência</label>
                  <p>{selectedRequest.urgencia}</p>
                </div>

                {selectedRequest.dataAgendamento && (
                  <div className="detail-group highlight-box">
                    <label>Data & Horário Agendado</label>
                    <p>📅 {selectedRequest.dataAgendamento} &bull; {selectedRequest.periodo}</p>
                  </div>
                )}

                {selectedRequest.descricao && (
                  <div className="detail-group">
                    <label>Observações / Descrição</label>
                    <p className="description-text">{selectedRequest.descricao}</p>
                  </div>
                )}

                {selectedRequest.criadoEm && (
                  <div className="detail-group date-created">
                    <small>Criado em: {new Date(selectedRequest.criadoEm).toLocaleString('pt-BR')}</small>
                  </div>
                )}
              </div>

              <button className="btn-close-detail" onClick={() => setSelectedRequest(null)}>
                Fechar Detalhes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}