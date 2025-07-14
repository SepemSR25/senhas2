import os
import sys
# DON\'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models import db

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), \'static\'))
app.config[\'SECRET_KEY\'] = \'asdf#FGSgvasgf$5$WGT\'

# Habilitar CORS para todas as rotas
CORS(app)

# Configurar banco de dados
app.config[\'SQLALCHEMY_DATABASE_URI\'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), \'database\', \'app.db\')}"
app.config[\'SQLALCHEMY_TRACK_MODIFICATIONS\'] = False
db.init_app(app)

# Importar modelos após inicializar o db
from src.models.user import User
from src.models.sala import Sala
from src.models.senha import Senha, Contador

# Importar blueprints
from src.routes.user import user_bp
from src.routes.sala import sala_bp
from src.routes.senha import senha_bp

app.register_blueprint(user_bp, url_prefix="/api")
app.register_blueprint(sala_bp, url_prefix="/api")
app.register_blueprint(senha_bp, url_prefix="/api")
with app.app_context():
    db.create_all()
    
    # Criar salas padrão se não existirem
    if Sala.query.count() == 0:
        salas_padrao = [
            {\'nome\': \'SALA 01\', \'descricao\': \'Sala de atendimento 01\'},
            {\'nome\': \'SALA 02\', \'descricao\': \'Sala de atendimento 02\'},
            {\'nome\': \'SALA 03\', \'descricao\': \'Sala de atendimento 03\'},
            {\'nome\': \'SALA 04\', \'descricao\': \'Sala de atendimento 04\'},
            {\'nome\': \'SALA 05\', \'descricao\': \'Sala de atendimento 05\'},
            {\'nome\': \'SALA 06\', \'descricao\': \'Sala de atendimento 06\'},
            {\'nome\': \'SALA 07\', \'descricao\': \'Sala de atendimento 07\'},
            {\'nome\': \'SALA 08\', \'descricao\': \'Sala de atendimento 08\'},
            {\'nome\': \'SALA 09\', \'descricao\': \'Sala de atendimento 09\'}
        ]
        
        for sala_data in salas_padrao:
            sala = Sala(nome=sala_data["nome"], descricao=sala_data["descricao"])
            db.session.add(sala)
            db.session.flush()
            
            # Criar contador para a sala
            contador = Contador(room_id=sala.id, valor=1)
            db.session.add(contador)
        
        db.session.commit()

@app.route("/")
@app.route("/<path:path>")
def serve_static_files(path=""):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, \'index.html\')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, \'index.html\')
        else:
            return "index.html not found", 404


if __name__ == \'__main__\':
    app.run(host=\'0.0.0.0\', port=5000, debug=True)





