from marshmallow import Schema, fields
from apiflask.fields import String, Nested, Integer, List, DateTime, Float


class OrderItemSchema(Schema):
    id = fields.Integer(dump_only=True)
    order_id = fields.Integer(dump_only=True)
    product_id = fields.Integer()
    quantity = fields.Integer()
    unit_price = fields.Float(dump_only=True)
    subtotal = fields.Float(dump_only=True)
    supplied_quantity = fields.Integer(allow_none=True)

class OrderRequestSchema(Schema):
    address_id = fields.Integer()
    comment = fields.String(allow_none=True)
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
    total_amount = fields.Float()
    is_locked = fields.Integer()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()
    estimated_delivery_at = fields.DateTime(allow_none=True)
    supplier_notes = fields.String(allow_none=True)
    address = fields.Nested(AdressSchema)
    items = fields.List(fields.Nested(OrderItemSchema))

class SupplierOrderItemSchema(Schema):
    id = fields.Integer(required=True)
    supplied_quantity = fields.Integer(required=True)

class SupplierFormRequestSchema(Schema):
    estimated_delivery_at = fields.DateTime(required=True)
    supplier_notes = fields.String(allow_none=True)
    items = fields.List(fields.Nested(SupplierOrderItemSchema), required=True)

class OrderUpdateRequestSchema(Schema):
    address_id = fields.Integer()
    comment = fields.String(allow_none=True)
    items = fields.List(fields.Nested(OrderItemSchema))

class OrderStatusRequestSchema(Schema):
    status = fields.String()

class OrderAssignUserSchema(Schema):
    user_id = fields.Integer()

class OrderAssignLocationSchema(Schema):
    location_id = fields.Integer()
