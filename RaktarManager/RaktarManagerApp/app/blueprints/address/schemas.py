from marshmallow import Schema
from apiflask.fields import String, Integer

class AddressSchema(Schema):
    id = Integer(dump_only=True)
    user_id = Integer(dump_only=True)
    country = String(required=True)
    city = String(required=True)
    street = String(required=True)
    postal_code = String(required=True)

class AddressUpdateSchema(Schema):
    country = String()
    city = String()
    street = String()
    postal_code = String()