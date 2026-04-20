from marshmallow import Schema, fields
from apiflask.fields import String, Email, Integer, Boolean, List, Nested

class RoleSchema(Schema):
    id = Integer()
    rolename = String()

class UserUpdateSchema(Schema):
    full_name = String()
    phone = String()
    is_active = Boolean()

class UserProfileUpdateSchema(Schema):
    phone = String()
    email = Email()

class RoleUpdateSchema(Schema):
    role_ids = List(Integer(), required=True)

class UserDetailResponseSchema(Schema):
    id = Integer()
    username = String()
    email = String()
    full_name = String()
    phone = String()
    is_active = Boolean()
    roles = List(Nested(RoleSchema))