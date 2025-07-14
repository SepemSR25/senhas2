// Configuração da API
const API_BASE_URL = '/api';

// Funções da API para Salas
class SalaAPI {
    static async listarSalas() {
        try {
            const response = await fetch(`${API_BASE_URL}/salas`);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao listar salas:', error);
            throw error;
        }
    }

    static async criarSala(nome, descricao = '') {
        try {
            const response = await fetch(`${API_BASE_URL}/salas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nome, descricao })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao criar sala:', error);
            throw error;
        }
    }

    static async obterSala(salaId) {
        try {
            const response = await fetch(`${API_BASE_URL}/salas/${salaId}`);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao obter sala:', error);
            throw error;
        }
    }

    static async obterEstatisticasSala(salaId) {
        try {
            const response = await fetch(`${API_BASE_URL}/salas/${salaId}/estatisticas`);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao obter estatísticas da sala:', error);
            throw error;
        }
    }

    static async deletarSala(salaId) {
        try {
            const response = await fetch(`${API_BASE_URL}/salas/${salaId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao deletar sala:', error);
            throw error;
        }
    }

    static async atualizarSala(salaId, dados) {
        try {
            const response = await fetch(`${API_BASE_URL}/salas/${salaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dados)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao atualizar sala:', error);
            throw error;
        }
    }

    // Alias para deletarSala para compatibilidade
    static async excluirSala(salaId) {
        return this.deletarSala(salaId);
    }
}

// Funções da API para Senhas (atualizadas para trabalhar com salas)
class SenhaAPI {
    static async gerarSenha(roomId) {
        try {
            const response = await fetch(`${API_BASE_URL}/senhas/gerar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ room_id: roomId })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao gerar senha:', error);
            throw error;
        }
    }

    static async listarSenhasEspera(roomId = null) {
        try {
            let url = `${API_BASE_URL}/senhas/espera`;
            if (roomId) {
                url += `?room_id=${roomId}`;
            }
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao listar senhas em espera:', error);
            throw error;
        }
    }

    static async chamarSenha(roomId, profissional) {
        try {
            const response = await fetch(`${API_BASE_URL}/senhas/chamar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ room_id: roomId, profissional })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao chamar próxima senha:', error);
            throw error;
        }
    }

    static async chamarSenhaEspecifica(roomId, numero, profissional) {
        try {
            const response = await fetch(`${API_BASE_URL}/senhas/chamar/${numero}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ room_id: roomId, profissional })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao chamar senha específica:', error);
            throw error;
        }
    }

    static async finalizarAtendimento(roomId) {
        try {
            const response = await fetch(`${API_BASE_URL}/senhas/finalizar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ room_id: roomId })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao finalizar atendimento:', error);
            throw error;
        }
    }

    static async obterSenhaAtual(roomId) {
        try {
            const url = roomId ? `${API_BASE_URL}/senhas/atual?room_id=${roomId}` : `${API_BASE_URL}/senhas/atual`;
            const response = await fetch(url);
            
            if (response.status === 404) {
                return null; // Nenhuma senha em atendimento
            }
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao obter senha atual:', error);
            throw error;
        }
    }

    static async obterTodasSenhasChamadas() {
        try {
            const response = await fetch(`${API_BASE_URL}/senhas/todas-chamadas`);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao obter todas as senhas chamadas:', error);
            throw error;
        }
    }

    static async listarTodasSenhas(roomId = null) {
        try {
            let url = `${API_BASE_URL}/senhas`;
            if (roomId) {
                url += `?room_id=${roomId}`;
            }
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao listar todas as senhas:', error);
            throw error;
        }
    }

    static async resetSistema(roomId = null) {
        try {
            const body = roomId ? { room_id: roomId } : {};
            
            const response = await fetch(`${API_BASE_URL}/senhas/reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao resetar sistema:', error);
            throw error;
        }
    }

    // Alias para compatibilidade
    static async listarSenhas(roomId) {
        return this.listarTodasSenhas(roomId);
    }

    static async resetarSala(roomId) {
        return this.resetSistema(roomId);
    }

    static async resetarAtendimento() {
        try {
            const response = await fetch(`${API_BASE_URL}/senhas/resetar-atendimento`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao resetar atendimento:', error);
            throw error;
        }
    }

    static async chamarUltimaSenhaNovamente(roomId, profissional) {
        try {
            const response = await fetch(`${API_BASE_URL}/senhas/chamar-ultima-novamente`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    room_id: roomId, 
                    profissional: profissional 
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao chamar última senha novamente:', error);
            throw error;
        }
    }
}

// Funções utilitárias
class Utils {
    static salvarSalaAtual(salaId) {
        localStorage.setItem('salaAtual', salaId);
    }

    static obterSalaAtual() {
        return localStorage.getItem('salaAtual');
    }

    static removerSalaAtual() {
        localStorage.removeItem('salaAtual');
    }
}

