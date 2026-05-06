from marshmallow import Schema, fields
from apiflask.fields import String, Integer, DateTime

class InventoryResponseSchema(Schema):
    id = fields.Integer()
    product_id = fields.Integer()
    location_id = fields.Integer()
    quantity = fields.Integer()
    updated_at = fields.DateTime(allow_none=True)

class InventoryLogResponseSchema(Schema):
    id = fields.Integer()
    inventory_id = fields.Integer()
    order_id = fields.Integer(allow_none=True)
    change_type = fields.String() 
    quantity_change = fields.Integer()
    performed_by = fields.Integer()
    note = fields.String(allow_none=True)
    created_at = fields.DateTime()


class InventoryRequestSchema(Schema):
    product_id = fields.Integer()
    location_id = fields.Integer()
    quantity = fields.Integer()
    order_id = fields.Integer(allow_none=True) 
    note = fields.String(allow_none=True)
