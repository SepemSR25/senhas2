from src.models import db

class Sala(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(80), unique=True, nullable=False)
    descricao = db.Column(db.String(120), nullable=True)
    senhas = db.relationship(\'Senha\', backref=\'sala\', lazy=True)
    contador = db.relationship(\'Contador\', backref=\'sala\', uselist=False)

    def __repr__(self):
        return f\'<Sala {self.nome}>\'


