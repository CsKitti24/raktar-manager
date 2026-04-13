from marshmallow import Schema, fields
from apiflask.fields import String, Nested, Integer, List, DateTime


class OrderItemSchema(Schema):
    id = fields.Integer(dump_only = True)
    order_id = fields.Integer(dump_only = True)
    product_id = fields.Integer()
    quantity = fields.Integer()

class OrderRequestSchema(Schema):
    address_id = fields.Integer()
    comment = fields.String(allow_none = True)
    items = fields.List(fields.Nested(OrderItemSchema))

class AdressSchema(Schema):
    country = fields.String()
    city = fields.String()
    street = fields.String()
    postal_code = fields.String()
  
class OrderResponseSchema(Schema):
    id = fields.Integer()
    order_number = fields.String()
    orderer_id = fields.Integer()
    supplier_id = fields.Integer(allow_none=True)
    carrier_id = fields.Integer(allow_none=True)
    warehouse_user_id = fields.Integer(allow_none=True)
    status = fields.String()
    comment = fields.String()
    total_amount = fields.Integer()
    is_locked = fields.Integer()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()
    address = fields.Nested(AdressSchema)
    items = fields.List(fields.Nested(OrderItemSchema))

class OrderUpdateRequestSchema(Schema):
    address_id = fields.Integer()
    comment = fields.String(allow_none = True)
    items = fields.List(fields.Nested(OrderItemSchema))

class OrderStatusRequestSchema(Schema):
    status = fields.String()

class OrderAssignUserSchema(Schema):
        user_id = fields.Integer()

class OrderAssignLocationSchema(Schema):
    location_id = fields.Integer()