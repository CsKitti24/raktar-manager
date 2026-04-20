from marshmallow import Schema, fields
from apiflask.fields import String, Integer, DateTime

class ComplaintCreateRequestSchema(Schema):
    order_id = fields.Integer()
    description = fields.String()
    file_name = fields.String(allow_none=True) 

class ComplaintUpdateRequestSchema(Schema):
    status = fields.String() 
    resolution = fields.String(allow_none=True)

class ComplaintResponseSchema(Schema):
    id = fields.Integer()
    order_id = fields.Integer()
    user_id = fields.Integer()
    description = fields.String()
    file_name = fields.String(allow_none=True)
    status = fields.String()
    resolution = fields.String(allow_none=True)
    created_at = fields.DateTime()
    resolved_at = fields.DateTime(allow_none=True)
