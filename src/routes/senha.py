from flask import Blueprint, jsonify, request
from src.models import db, Senha, Sala, Contador
from datetime import datetime

senha_bp = Blueprint(\'senha_bp\', __name__)

@senha_bp.route(\'/senhas/gerar\', methods=[\'POST\'])
def gerar_senha():
    data = request.get_json()
    room_id = data.get(\'room_id\')

    if not room_id:
        return jsonify({\'error\': \'ID da sala é obrigatório\'}), 400

    sala = Sala.query.get(room_id)
    if not sala:
        return jsonify({\'error\': \'Sala não encontrada\'}), 404

    contador = Contador.query.filter_by(room_id=room_id).first()
    if not contador:
        contador = Contador(room_id=room_id, valor=1)
        db.session.add(contador)
        db.session.commit()

    prefixo_sala = sala.nome.replace(\'SALA \', \'S\')
    numero_senha = f\'{prefixo_sala}-{contador.valor:03d}\'

    nova_senha = Senha(
        numero=numero_senha,
        sala_id=room_id,
        status=\'espera\',
        gerada_em=datetime.now()
    )
    db.session.add(nova_senha)
    db.session.commit()

    contador.valor += 1
    db.session.commit()

    return jsonify({
        \'message\': \'Senha gerada com sucesso\',
        \'senha\': {
            \'numero\': nova_senha.numero,
            \'sala\': sala.nome,
            \'gerada_em\': nova_senha.gerada_em.isoformat()
        }
    }), 201

@senha_bp.route(\'/senhas/chamar\', methods=[\'POST\'])
def chamar_senha():
    data = request.get_json()
    room_id = data.get(\'room_id\')
    profissional = data.get(\'profissional\')

    if not room_id:
        return jsonify({\'error\': \'ID da sala é obrigatório\'}), 400

    senha_espera = Senha.query.filter_by(sala_id=room_id, status=\'espera\').order_by(Senha.gerada_em).first()

    if not senha_espera:
        return jsonify({\'message\': \'Não há senhas em espera para esta sala\'}), 200

    senha_espera.status = \'chamada\'
    senha_espera.chamada_em = datetime.now()
    senha_espera.profissional = profissional
    db.session.commit()

    sala = Sala.query.get(room_id)

    return jsonify({
        \'message\': \'Senha chamada com sucesso\',
        \'senha\': {
            \'numero\': senha_espera.numero,
            \'sala\': sala.nome,
            \'chamada_em\': senha_espera.chamada_em.isoformat(),
            \'profissional\': senha_espera.profissional
        }
    }), 200

@senha_bp.route(\'/senhas/chamar-ultima-novamente\', methods=[\'POST\'])
def chamar_ultima_senha_novamente():
    data = request.get_json()
    room_id = data.get(\'room_id\')
    profissional = data.get(\'profissional\')

    if not room_id:
        return jsonify({\'error\': \'ID da sala é obrigatório\'}), 400

    ultima_senha_chamada = Senha.query.filter_by(sala_id=room_id, status=\'chamada\').order_by(Senha.chamada_em.desc()).first()

    if not ultima_senha_chamada:
        return jsonify({\'message\': \'Não há senhas chamadas para esta sala\'}), 200

    ultima_senha_chamada.chamada_em = datetime.now()
    ultima_senha_chamada.profissional = profissional
    db.session.commit()

    sala = Sala.query.get(room_id)

    return jsonify({
        \'message\': \'Última senha chamada novamente com sucesso\',
        \'senha\': {
            \'numero\': ultima_senha_chamada.numero,
            \'sala\': sala.nome,
            \'chamada_em\': ultima_senha_chamada.chamada_em.isoformat(),
            \'profissional\': ultima_senha_chamada.profissional
        }
    }), 200

@senha_bp.route(\'/senhas/espera\', methods=[\'GET\'])
def get_senhas_espera():
    room_id = request.args.get(\'room_id\', type=int)
    if room_id:
        senhas = Senha.query.filter_by(sala_id=room_id, status=\'espera\').order_by(Senha.gerada_em).all()
    else:
        senhas = Senha.query.filter_by(status=\'espera\').order_by(Senha.gerada_em).all()
    
    result = []
    for senha in senhas:
        sala = Sala.query.get(senha.sala_id)
        result.append({
            \'numero\': senha.numero,
            \'sala\': sala.nome if sala else \'Desconhecida\',
            \'gerada_em\': senha.gerada_em.isoformat()
        })
    return jsonify(result)

@senha_bp.route(\'/senhas/chamadas\', methods=[\'GET\'])
def get_senhas_chamadas():
    room_id = request.args.get(\'room_id\', type=int)
    if room_id:
        senhas = Senha.query.filter_by(sala_id=room_id, status=\'chamada\').order_by(Senha.chamada_em.desc()).all()
    else:
        senhas = Senha.query.filter_by(status=\'chamada\').order_by(Senha.chamada_em.desc()).all()
    
    result = []
    for senha in senhas:
        sala = Sala.query.get(senha.sala_id)
        result.append({
            \'numero\': senha.numero,
            \'sala\': sala.nome if sala else \'Desconhecida\',
            \'chamada_em\': senha.chamada_em.isoformat(),
            \'profissional\': senha.profissional
        })
    return jsonify(result)

@senha_bp.route(\'/senhas/todas-chamadas\', methods=[\'GET\'])
def get_todas_senhas_chamadas():
    senhas = Senha.query.filter_by(status=\'chamada\').order_by(Senha.chamada_em.desc()).all()
    
    result = []
    for senha in senhas:
        sala = Sala.query.get(senha.sala_id)
        result.append({
            \'numero\': senha.numero,
            \'sala\': sala.nome if sala else \'Desconhecida\',
            \'timestamp\': senha.chamada_em.isoformat(), # Corrigido para timestamp
            \'profissional\': senha.profissional
        })
    return jsonify(result)

@senha_bp.route(\'/senhas/atendidas\', methods=[\'GET\'])
def get_senhas_atendidas():
    room_id = request.args.get(\'room_id\', type=int)
    if room_id:
        senhas = Senha.query.filter_by(sala_id=room_id, status=\'atendida\').order_by(Senha.chamada_em.desc()).all()
    else:
        senhas = Senha.query.filter_by(status=\'atendida\').order_by(Senha.chamada_em.desc()).all()
    
    result = []
    for senha in senhas:
        sala = Sala.query.get(senha.sala_id)
        result.append({
            \'numero\': senha.numero,
            \'sala\': sala.nome if sala else \'Desconhecida\',
            \'chamada_em\': senha.chamada_em.isoformat(),
            \'profissional\': senha.profissional
        })
    return jsonify(result)

@senha_bp.route(\'/senhas/atender\', methods=[\'POST\'])
def atender_senha():
    data = request.get_json()
    senha_numero = data.get(\'senha_numero\')

    if not senha_numero:
        return jsonify({\'error\': \'Número da senha é obrigatório\'}), 400

    senha = Senha.query.filter_by(numero=senha_numero, status=\'chamada\').first()

    if not senha:
        return jsonify({\'message\': \'Senha não encontrada ou não está em status de chamada\'}), 200

    senha.status = \'atendida\'
    senha.atendida_em = datetime.now()
    db.session.commit()

    return jsonify({\'message\': \'Senha atendida com sucesso\'}), 200

@senha_bp.route(\'/senhas/resetar-atendimento\', methods=[\'POST\'])
def resetar_atendimento():
    # Mover todas as senhas com status \'chamada\' para \'atendida\'
    senhas_chamadas = Senha.query.filter_by(status=\'chamada\').all()
    for senha in senhas_chamadas:
        senha.status = \'atendida\'
        senha.atendida_em = datetime.now()
    db.session.commit()

    # Resetar todos os contadores para 1
    contadores = Contador.query.all()
    for contador in contadores:
        contador.valor = 1
    db.session.commit()

    return jsonify({\'message\': \'Atendimento resetado com sucesso. Todas as senhas chamadas foram movidas para atendidas e os contadores foram resetados.\'}), 200

@senha_bp.route(\'/senhas/estatisticas\', methods=[\'GET\'])
def get_estatisticas():
    room_id = request.args.get(\'room_id\', type=int)
    
    if room_id:
        total_geradas = Senha.query.filter_by(sala_id=room_id).count()
        total_espera = Senha.query.filter_by(sala_id=room_id, status=\'espera\').count()
        total_chamadas = Senha.query.filter_by(sala_id=room_id, status=\'chamada\').count()
        total_atendidas = Senha.query.filter_by(sala_id=room_id, status=\'atendida\').count()
    else:
        total_geradas = Senha.query.count()
        total_espera = Senha.query.filter_by(status=\'espera\').count()
        total_chamadas = Senha.query.filter_by(status=\'chamada\').count()
        total_atendidas = Senha.query.filter_by(status=\'atendida\').count()

    return jsonify({
        \'total_geradas\': total_geradas,
        \'total_espera\': total_espera,
        \'total_chamadas\': total_chamadas,
        \'total_atendidas\': total_atendidas
    })

@senha_bp.route(\'/senhas/atual\', methods=[\'GET\'])
def get_senha_atual():
    room_id = request.args.get(\'room_id\', type=int)
    if room_id:
        senha_atual = Senha.query.filter_by(sala_id=room_id, status=\'chamada\').order_by(Senha.chamada_em.desc()).first()
    else:
        senha_atual = Senha.query.filter_by(status=\'chamada\').order_by(Senha.chamada_em.desc()).first()

    if not senha_atual:
        return jsonify({\'message\': \'Nenhuma senha sendo chamada no momento\'}), 404

    sala = Sala.query.get(senha_atual.sala_id)

    return jsonify({
        \'numero\': senha_atual.numero,
        \'sala\': sala.nome if sala else \'Desconhecida\',
        \'chamada_em\': senha_atual.chamada_em.isoformat(),
        \'profissional\': senha_atual.profissional
    })


