from marshmallow import Schema, fields

class DashboardSummaryResponseSchema(Schema):
    total_orders = fields.Integer()
    active_complaints = fields.Integer()
    low_stock_items = fields.Integer()
    active_storage_locations = fields.Integer()
