from marshmallow import Schema, fields
from apiflask.fields import String, Email, Nested, Integer, List
from apiflask.validators import Email

#Address 
class AddressSchema(Schema):
    city= fields.String()
    street= fields.String()
    postalcode = fields.Integer()

#Regisztráció
class UserRequestSchema(Schema):
    name = fields.String()
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

#Beléptetés
class UserLoginSchema(Schema):
    email = String(validate=Email())
    password = fields.String()