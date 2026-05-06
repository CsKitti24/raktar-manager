from app.extensions import auth
from app.blueprints.dashboard import bp 
from app.blueprints.dashboard.schemas import DashboardSummaryResponseSchema
from app.blueprints.dashboard.service import DashboardService
from apiflask import HTTPError

#Szerepkör-specifikus dashboard adatok   ✔
@bp.get('/summary')  
@bp.doc(tags=["dashboard"])
@bp.auth_required(auth)
@bp.output(DashboardSummaryResponseSchema)
def get_summary():
    success, response = DashboardService.get_summary(auth.current_user)
    if success:
        return response, 200
    raise HTTPError(message=response, status_code=400)
