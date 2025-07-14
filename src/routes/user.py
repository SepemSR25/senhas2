from flask import Blueprint, jsonify, request
from src.models import db, User

user_bp = Blueprint(\'user_bp\', __name__)

@user_bp.route(\'/users/register\', methods=[\'POST\'])
def register_user():
    data = request.get_json()
    username = data.get(\'username\')
    password = data.get(\'password\')

    if not username or not password:
        return jsonify({\'error\': \'Username and password are required\'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({\'error\': \'User already exists\'}), 409

    new_user = User(username=username, password=password) # In a real app, hash the password!
    db.session.add(new_user)
    db.session.commit()

    return jsonify({\'message\': \'User registered successfully\'}), 201

@user_bp.route(\'/users/login\', methods=[\'POST\'])
def login_user():
    data = request.get_json()
    username = data.get(\'username\')
    password = data.get(\'password\')

    user = User.query.filter_by(username=username, password=password).first() # In a real app, check hashed password!

    if user:
        return jsonify({\'message\': \'Login successful\'}), 200
    else:
        return jsonify({\'message\': \'Invalid credentials\'}), 401


