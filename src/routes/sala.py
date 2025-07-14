from flask import Blueprint, jsonify, request
from src.models import db, Sala, Contador

sala_bp = Blueprint(\'sala_bp\', __name__)

@sala_bp.route(\'/salas\', methods=[\'GET\'])
def get_salas():
    salas = Sala.query.all()
    return jsonify([{\'id\': sala.id, \'nome\': sala.nome, \'descricao\': sala.descricao} for sala in salas])

@sala_bp.route(\'/salas\', methods=[\'POST\'])
def add_sala():
    data = request.get_json()
    nome = data.get(\'nome\')
    descricao = data.get(\'descricao\')

    if not nome:
        return jsonify({\'error\': \'Nome da sala é obrigatório\'}), 400

    if Sala.query.filter_by(nome=nome).first():
        return jsonify({\'error\': \'Sala já existe\'}), 409

    nova_sala = Sala(nome=nome, descricao=descricao)
    db.session.add(nova_sala)
    db.session.flush() # Para ter acesso ao ID da nova_sala

    # Criar contador para a nova sala
    contador = Contador(room_id=nova_sala.id, valor=1)
    db.session.add(contador)
    db.session.commit()

    return jsonify({\'message\': \'Sala adicionada com sucesso\', \'id\': nova_sala.id}), 201

@sala_bp.route(\'/salas/<int:id>\', methods=[\'DELETE\'])
def delete_sala(id):
    sala = Sala.query.get_or_404(id)
    db.session.delete(sala)
    db.session.commit()
    return jsonify({\'message\': \'Sala deletada com sucesso\'}), 200


