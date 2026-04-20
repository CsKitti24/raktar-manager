from marshmallow import Schema
from apiflask.fields import String, Integer, Float, Boolean, List, Nested

class CategorySchema(Schema):
    id = Integer(dump_only=True)
    name = String(required=True)
    description = String()

class ProductSchema(Schema):
    id = Integer(dump_only=True)
    category_id = Integer(required=True)
    name = String(required=True)
    description = String()
    sku = String(required=True)
    price = Float(required=True)
    is_active = Boolean(dump_only=True)

class ProductUpdateSchema(Schema):
    category_id = Integer()
    name = String()
    description = String()
    sku = String()
    price = Float()
    is_active = Boolean()