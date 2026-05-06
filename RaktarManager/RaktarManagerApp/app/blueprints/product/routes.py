from apiflask import APIBlueprint, HTTPError
from app.blueprints.product import bp
from app.extensions import auth
from app.blueprints.product.schemas import ProductSchema, CategorySchema, ProductUpdateSchema
from app.blueprints.product.service import ProductService
from app.blueprints import role_required 

@bp.route('/')

def index():
    return 'This is The Product Blueprint'

#kategoriak
@bp.get('/categories')
@bp.auth_required(auth)
@bp.output(CategorySchema(many=True))
def get_categories():
    return ProductService.get_all_categories()

@bp.post('/categories')
@bp.auth_required(auth)
@role_required(['Admin'])
@bp.input(CategorySchema)
def add_category(json_data):
    return ProductService.create_category(json_data)

#termekek
@bp.get('/products')
@bp.auth_required(auth)
@bp.output(ProductSchema(many=True))
def list_products():
    return ProductService.get_products()

@bp.post('/products')
@bp.auth_required(auth)
@role_required(['Admin'])
@bp.input(ProductSchema)
def add_product(json_data):
    return ProductService.create_product(json_data)

@bp.put('/products/<int:id>')
@bp.auth_required(auth)
@role_required(['Admin'])
@bp.input(ProductUpdateSchema)
def update_product(id, json_data):
    res = ProductService.update_product(id, json_data)
    if not res: raise HTTPError(404)
    return res

@bp.delete('/products/<int:id>')
@bp.auth_required(auth)
@role_required(['Admin'])
def delete_product(id):
    if ProductService.delete_product(id): return {"message": "Sikeres törlés"}
    raise HTTPError(404)