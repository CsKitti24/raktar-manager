from marshmallow import Schema, fields
from apiflask.fields import String, Email, Integer
from apiflask.validators import Email

class UserLoginSchema(Schema):
    email = String(required=True, validate=Email())
    password = String(required=True)

class RegisterRequestSchema(Schema):
    username = String(required=True)
    full_name = String(required=True)
    email = String(required=True, validate=Email())
    password = String(required=True)
    phone = String()

class UserResponseSchema(Schema):
    id = Integer()
    username = String()
    email = String()
    token = String()

class TokenResponseSchema(Schema):
    token = String()
    user_id = Integer()