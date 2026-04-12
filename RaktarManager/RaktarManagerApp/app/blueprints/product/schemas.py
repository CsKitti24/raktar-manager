from marshmallow import Schema, fields
from apiflask.fields import String, Integer, Float, Boolean

class CategorySchema(Schema):
    id = fields.Integer(dump_only=True)
    name = fields.String(required=True)
    description = fields.String()

class ProductSchema(Schema):
    id = fields.Integer(dump_only=True)
    name = fields.String(required=True)
    description = fields.String()
    sku = fields.String()
    price = fields.Float(required=True)
    category_id = fields.Integer(required=True)
    is_active = fields.Boolean(dump_only=True)


