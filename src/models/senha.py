from src.models import db
from datetime import datetime

class Senha(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    numero = db.Column(db.String(10), nullable=False)
    sala_id = db.Column(db.Integer, db.ForeignKey(\'sala.id\

    def __repr__(self):
        return f\'<Senha {self.numero}>\'

class Contador(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey(\'sala.id\
    valor = db.Column(db.Integer, default=1)

    def __repr__(self):
        return f\'<Contador Sala {self.room_id}: {self.valor}>\'


