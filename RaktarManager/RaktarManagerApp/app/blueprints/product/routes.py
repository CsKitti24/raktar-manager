from apiflask import APIBlueprint, HTTPError
from .schemas import ProductSchema, CategorySchema
from .service import ProductService

bp = APIBlueprint('product', __name__, url_prefix='/api')

@bp.get('/products')
@bp.output(ProductSchema(many=True))
def list_products():
    return ProductService.get_all_products()

@bp.post('/products')
@bp.input(ProductSchema, location="json")
@bp.output(ProductSchema)
def create_product(json_data):
    return ProductService.create_product(json_data)

@bp.get('/categories')
@bp.output(CategorySchema(many=True))
def list_categories():
    return ProductService.get_all_categories()

@bp.post('/categories')
@bp.input(CategorySchema, location="json")
@bp.output(CategorySchema)
def create_category(json_data):
    return ProductService.create_category(json_data)