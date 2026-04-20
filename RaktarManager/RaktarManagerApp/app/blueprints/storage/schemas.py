from marshmallow import Schema, fields

class StorageLocationRequestSchema(Schema):
    code = fields.String()
    description = fields.String(allow_none=True)

class StorageLocationResponseSchema(Schema):
    id = fields.Integer()
    code = fields.String()
    description = fields.String(allow_none=True)
    is_active = fields.Integer()
    created_at = fields.DateTime()
