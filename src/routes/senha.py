from flask import Blueprint, request, jsonify
from datetime import datetime
from src.models import db
from src.models.senha import Senha, Contador
from src.models.sala import Sala

senha_bp = Blueprint('senha', __name__)

@senha_bp.route('/senhas', methods=['GET'])
def listar_senhas():
    """Lista todas as senhas"""
    try:
        room_id = request.args.get('room_id', type=int)
        
        query = Senha.query
        if room_id:
            query = query.filter_by(room_id=room_id)
        
        senhas = query.order_by(Senha.timestamp.desc()).all()
        return jsonify([senha.to_dict() for senha in senhas])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@senha_bp.route('/senhas/espera', methods=['GET'])
def listar_senhas_espera():
    """Lista senhas em espera"""
    try:
        room_id = request.args.get('room_id', type=int)
        
        query = Senha.query.filter_by(status='espera')
        if room_id:
            query = query.filter_by(room_id=room_id)
        
        senhas = query.order_by(Senha.timestamp.asc()).all()
        return jsonify([senha.to_dict() for senha in senhas])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@senha_bp.route('/senhas/gerar', methods=['POST'])
def gerar_senha():
    """Gera uma nova senha"""
    try:
        data = request.get_json()
        room_id = data.get('room_id')
        
        if not room_id:
            return jsonify({'error': 'ID da sala é obrigatório'}), 400
        
        # Verificar se a sala existe e está ativa
        sala = Sala.query.filter_by(id=room_id, ativa=True).first()
        if not sala:
            return jsonify({'error': 'Sala não encontrada ou inativa'}), 404
        
        # Buscar ou criar contador para a sala
        contador = Contador.query.filter_by(room_id=room_id).first()
        if not contador:
            contador = Contador(room_id=room_id, valor=1)
            db.session.add(contador)
        
        # Gerar prefixo baseado no nome da sala
        prefixo = "S"
        if "SALA 01" in sala.nome:
            prefixo = "S1"
        elif "SALA 02" in sala.nome:
            prefixo = "S2"
        elif "SALA 03" in sala.nome:
            prefixo = "S3"
        elif "SALA 04" in sala.nome:
            prefixo = "S4"
        elif "SALA 05" in sala.nome:
            prefixo = "S5"
        elif "SALA 09" in sala.nome:
            prefixo = "S9"
        else:
            # Para salas customizadas, usar apenas "S"
            prefixo = "S"
        
        # Gerar número da senha (formato: S1-001, S2-001, etc.)
        numero = f"{prefixo}-{str(contador.valor).zfill(3)}"
        
        # Criar nova senha
        nova_senha = Senha(
            numero=numero,
            room_id=room_id,
            status='espera'
        )
        
        # Incrementar contador
        contador.valor += 1
        
        db.session.add(nova_senha)
        db.session.commit()
        
        return jsonify(nova_senha.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@senha_bp.route('/senhas/chamar', methods=['POST'])
def chamar_senha():
    """Chama a próxima senha da fila"""
    try:
        data = request.get_json()
        profissional = data.get('profissional', 'Profissional')
        room_id = data.get('room_id')
        
        if not room_id:
            return jsonify({'error': 'ID da sala é obrigatório'}), 400
        
        # Verificar se a sala existe e está ativa
        sala = Sala.query.filter_by(id=room_id, ativa=True).first()
        if not sala:
            return jsonify({'error': 'Sala não encontrada ou inativa'}), 404
        
        # Buscar próxima senha da sala
        senha = Senha.query.filter_by(
            room_id=room_id, 
            status='espera'
        ).order_by(Senha.timestamp.asc()).first()
        
        if not senha:
            return jsonify({'error': 'Não há senhas na fila desta sala'}), 404
        
        # Atualizar status da senha
        senha.status = 'chamada'
        senha.profissional = profissional
        senha.hora_chamada = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify(senha.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@senha_bp.route('/senhas/chamar/<numero>', methods=['POST'])
def chamar_senha_especifica(numero):
    """Chama uma senha específica"""
    try:
        data = request.get_json()
        profissional = data.get('profissional', 'Profissional')
        room_id = data.get('room_id')
        
        if not room_id:
            return jsonify({'error': 'ID da sala é obrigatório'}), 400
        
        senha = Senha.query.filter_by(
            numero=numero.upper(), 
            room_id=room_id,
            status='espera'
        ).first()
        
        if not senha:
            return jsonify({'error': 'Senha não encontrada nesta sala ou já foi atendida'}), 404
        
        # Atualizar status da senha
        senha.status = 'chamada'
        senha.profissional = profissional
        senha.hora_chamada = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify(senha.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@senha_bp.route('/senhas/finalizar/<numero>', methods=['POST'])
def finalizar_atendimento(numero):
    """Finaliza o atendimento de uma senha"""
    try:
        data = request.get_json()
        room_id = data.get('room_id')
        
        if not room_id:
            return jsonify({'error': 'ID da sala é obrigatório'}), 400
        
        senha = Senha.query.filter_by(
            numero=numero.upper(), 
            room_id=room_id,
            status='chamada'
        ).first()
        
        if not senha:
            return jsonify({'error': 'Senha não encontrada nesta sala ou não está em atendimento'}), 404
        
        # Atualizar status da senha
        senha.status = 'atendida'
        senha.hora_finalizacao = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify(senha.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@senha_bp.route('/senhas/atual', methods=['GET'])
def senha_atual():
    """Retorna a senha atualmente sendo chamada"""
    try:
        room_id = request.args.get('room_id', type=int)
        
        query = Senha.query.filter_by(status='chamada')
        if room_id:
            query = query.filter_by(room_id=room_id)
        
        senha = query.order_by(Senha.hora_chamada.desc()).first()
        
        if senha:
            return jsonify(senha.to_dict())
        else:
            return jsonify({'message': 'Nenhuma senha em atendimento'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@senha_bp.route('/senhas/todas-chamadas', methods=['GET'])
def todas_senhas_chamadas():
    """Retorna todas as senhas atualmente sendo chamadas de todas as salas"""
    try:
        # Buscar todas as senhas com status 'chamada' incluindo informações da sala
        senhas_chamadas = db.session.query(Senha, Sala).join(
            Sala, Senha.room_id == Sala.id
        ).filter(
            Senha.status == 'chamada',
            Sala.ativa == True
        ).order_by(Senha.hora_chamada.desc()).all()
        
        resultado = []
        for senha, sala in senhas_chamadas:
            resultado.append({
                'id': senha.id,
                'numero': senha.numero,
                'status': senha.status,
                'gerada_em': senha.timestamp.isoformat() if senha.timestamp else None,
                'chamada_em': senha.hora_chamada.isoformat() if senha.hora_chamada else None,
                'profissional': senha.profissional,
                'room_id': senha.room_id,
                'sala_nome': sala.nome,
                'sala_descricao': sala.descricao
            })
        
        return jsonify(resultado)
        
    except Exception as e:
        print(f"Erro no endpoint todas-chamadas: {str(e)}")
        return jsonify({'error': str(e)}), 500

@senha_bp.route('/senhas/estatisticas', methods=['GET'])
def estatisticas():
    """Retorna estatísticas do sistema"""
    try:
        room_id = request.args.get('room_id', type=int)
        
        query = Senha.query
        if room_id:
            query = query.filter_by(room_id=room_id)
        
        total_senhas = query.count()
        senhas_espera = query.filter_by(status='espera').count()
        senhas_chamadas = query.filter_by(status='chamada').count()
        senhas_atendidas = query.filter_by(status='atendida').count()
        
        result = {
            'total_senhas': total_senhas,
            'senhas_espera': senhas_espera,
            'senhas_chamadas': senhas_chamadas,
            'senhas_atendidas': senhas_atendidas
        }
        
        if room_id:
            sala = Sala.query.get(room_id)
            if sala:
                result['sala'] = sala.to_dict()
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@senha_bp.route('/senhas/reset', methods=['POST'])
def reset_sistema():
    """Reset do sistema (apenas para desenvolvimento)"""
    try:
        room_id = request.get_json().get('room_id') if request.get_json() else None
        
        if room_id:
            # Reset apenas de uma sala específica
            Senha.query.filter_by(room_id=room_id).delete()
            contador = Contador.query.filter_by(room_id=room_id).first()
            if contador:
                contador.valor = 1
        else:
            # Reset completo do sistema
            Senha.query.delete()
            Contador.query.delete()
            # Não deletamos as salas, apenas resetamos os contadores
            salas = Sala.query.filter_by(ativa=True).all()
            for sala in salas:
                contador = Contador(room_id=sala.id, valor=1)
                db.session.add(contador)
        
        db.session.commit()
        
        return jsonify({'message': 'Sistema resetado com sucesso'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@senha_bp.route('/senhas/resetar-atendimento', methods=['POST'])
def resetar_atendimento():
    """Reset do display da TV - limpa todas as senhas chamadas"""
    try:
        # Atualizar todas as senhas com status 'chamada' para 'atendida'
        senhas_chamadas = Senha.query.filter_by(status='chamada').all()
        
        for senha in senhas_chamadas:
            senha.status = 'atendida'
            senha.hora_finalizacao = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Display da TV resetado com sucesso',
            'senhas_resetadas': len(senhas_chamadas)
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@senha_bp.route('/senhas/chamar-ultima-novamente', methods=['POST'])
def chamar_ultima_senha_novamente():
    """Chama a última senha novamente"""
    try:
        data = request.get_json()
        room_id = data.get('room_id')
        profissional = data.get('profissional', 'Profissional')
        
        if not room_id:
            return jsonify({'error': 'ID da sala é obrigatório'}), 400
        
        # Verificar se a sala existe e está ativa
        sala = Sala.query.filter_by(id=room_id, ativa=True).first()
        if not sala:
            return jsonify({'error': 'Sala não encontrada ou inativa'}), 404
        
        # Buscar a última senha chamada desta sala
        ultima_senha = Senha.query.filter_by(
            room_id=room_id,
            status='chamada'
        ).order_by(Senha.hora_chamada.desc()).first()
        
        if not ultima_senha:
            return jsonify({'error': 'Não há senha chamada para repetir'}), 404
        
        # Atualizar informações da chamada
        ultima_senha.profissional = profissional
        ultima_senha.hora_chamada = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': f'Senha {ultima_senha.numero} chamada novamente com sucesso',
            'senha': ultima_senha.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

