const API_BASE_URL = window.location.origin;

async function fetchSalas() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/salas`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const salas = await response.json();
        return salas;
    } catch (error) {
        console.error("Erro ao buscar salas:", error);
        return [];
    }
}

async function gerarSenha(roomId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/senhas/gerar`, {
            method: \"POST\",
            headers: {
                \"Content-Type\": \"application/json\"
            },
            body: JSON.stringify({ room_id: roomId })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erro ao gerar senha:", error);
        return null;
    }
}

async function chamarSenha(roomId, profissional) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/senhas/chamar`, {
            method: \"POST\",
            headers: {
                \"Content-Type\": \"application/json\"
            },
            body: JSON.stringify({ room_id: roomId, profissional: profissional })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erro ao chamar senha:", error);
        return null;
    }
}

async function chamarUltimaSenhaNovamente(roomId, profissional) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/senhas/chamar-ultima-novamente`, {
            method: \"POST\",
            headers: {
                \"Content-Type\": \"application/json\"
            },
            body: JSON.stringify({ room_id: roomId, profissional: profissional })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erro ao chamar última senha novamente:", error);
        return null;
    }
}

async function fetchSenhasEmEspera(roomId = null) {
    try {
        const url = roomId ? `${API_BASE_URL}/api/senhas/espera?room_id=${roomId}` : `${API_BASE_URL}/api/senhas/espera`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const senhas = await response.json();
        return senhas;
    } catch (error) {
        console.error("Erro ao buscar senhas em espera:", error);
        return [];
    }
}

async function fetchSenhasChamadas(roomId = null) {
    try {
        const url = roomId ? `${API_BASE_URL}/api/senhas/chamadas?room_id=${roomId}` : `${API_BASE_URL}/api/senhas/chamadas`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const senhas = await response.json();
        return senhas;
    } catch (error) {
        console.error("Erro ao buscar senhas chamadas:", error);
        return [];
    }
}

async function fetchTodasSenhasChamadas() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/senhas/todas-chamadas`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const senhas = await response.json();
        return senhas;
    } catch (error) {
        console.error("Erro ao buscar todas as senhas chamadas:", error);
        return [];
    }
}

async function fetchEstatisticas(roomId = null) {
    try {
        const url = roomId ? `${API_BASE_URL}/api/senhas/estatisticas?room_id=${roomId}` : `${API_BASE_URL}/api/senhas/estatisticas`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const stats = await response.json();
        return stats;
    } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        return null;
    }
}

async function resetarAtendimento() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/senhas/resetar-atendimento`, {
            method: \"POST\",
            headers: {
                \"Content-Type\": \"application/json\"
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erro ao resetar atendimento:", error);
        return null;
    }
}

async function fetchSenhaAtual(roomId = null) {
    try {
        const url = roomId ? `${API_BASE_URL}/api/senhas/atual?room_id=${roomId}` : `${API_BASE_URL}/api/senhas/atual`;
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404) {
                return null; // Nenhuma senha sendo chamada no momento
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const senha = await response.json();
        return senha;
    } catch (error) {
        console.error("Erro ao buscar senha atual:", error);
        return null;
    }
}

async function atenderSenha(senhaNumero) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/senhas/atender`, {
            method: \"POST\",
            headers: {
                \"Content-Type\": \"application/json\"
            },
            body: JSON.stringify({ senha_numero: senhaNumero })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erro ao atender senha:", error);
        return null;
    }
}


