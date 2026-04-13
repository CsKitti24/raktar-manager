from marshmallow import Schema, fields
from apiflask.fields import String, Email, Nested, Integer, List
from apiflask.validators import Email

#Address 
class AddressSchema(Schema):
    city= fields.String()
    street= fields.String()
    postal_code = fields.Integer()
    country = fields.String()

#Regisztráció
class UserRequestSchema(Schema):
    username = fields.String()
    full_name = fields.String()
    email = String(validate=Email())
    password = fields.String()
    phone = fields.String()
    address = fields.Nested(AddressSchema)

#Reg utáni id
class UserResponseSchema(Schema):
    id = fields.Integer()
    name = fields.String()
    email = fields.String()
    address = fields.Nested(AddressSchema)
    token = fields.String()

#Beléptetés
class UserLoginSchema(Schema):
    email = String(validate=Email())
    password = fields.String()


class RoleSchema(Schema):
    id = fields.Integer()
    rolename = fields.String()


class PayloadSchema(Schema):
    user_id = fields.Integer()
    roles  = fields.List(fields.Nested(RoleSchema))
    exp = fields.Integer()