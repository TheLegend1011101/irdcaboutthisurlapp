from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import Click, Url, User
from ..schemas import ClickOut, CreateUrl, UrlOut, UrlWithCount
from ..utils.shortener import generate_short_code

router = APIRouter(tags=["urls"])

@router.post("/api/urls", response_model=UrlOut, status_code=201)
def create_url(
    payload: CreateUrl,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_url = Url(
        original_url=str(payload.original_url),
        user_id=current_user.id,
        short_code=None,
    )
    db.add(new_url)
    db.flush()
    new_url.short_code = generate_short_code(new_url.id)
    db.commit()
    db.refresh(new_url)
    return new_url


@router.get("/api/urls", response_model=list[UrlWithCount])
def list_urls(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(Url, func.count(Click.id).label("click_count"))
        .outerjoin(Click, Click.url_id == Url.id)
        .filter(Url.user_id == current_user.id)
        .group_by(Url.id)
        .order_by(Url.created_at.desc())
        .all()
    )
    return [
        UrlWithCount(
            id=u.id,
            original_url=u.original_url,
            short_code=u.short_code,
            created_at=u.created_at,
            click_count=count,
        )
        for u, count in rows
    ]


@router.get("/api/urls/{url_id}", response_model=UrlWithCount)
def get_url_detail(
    url_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = (
        db.query(Url, func.count(Click.id).label("click_count"))
        .outerjoin(Click, Click.url_id == Url.id)
        .filter(Url.id == url_id, Url.user_id == current_user.id)
        .group_by(Url.id)
        .first()
    )
    if not row:
        raise HTTPException(404, "URL not found")
    u, count = row
    return UrlWithCount(
        id=u.id,
        original_url=u.original_url,
        short_code=u.short_code,
        created_at=u.created_at,
        click_count=count,
    )


@router.get("/api/urls/{url_id}/clicks", response_model=list[ClickOut])
def get_url_clicks(
    url_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    url = (
        db.query(Url)
        .filter(Url.id == url_id, Url.user_id == current_user.id)
        .first()
    )
    if not url:
        raise HTTPException(404, "URL not found")
    return (
        db.query(Click)
        .filter(Click.url_id == url_id)
        .order_by(Click.timestamp.desc())
        .limit(200)
        .all()
    )


@router.delete("/api/urls/{url_id}", status_code=204)
def delete_url(
    url_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    url = (
        db.query(Url)
        .filter(Url.id == url_id, Url.user_id == current_user.id)
        .first()
    )
    if not url:
        raise HTTPException(404, "URL not found")
    db.delete(url)
    db.commit()
    return None

@router.get("/r/{short_code}")
def redirect_url(
    short_code: str,
    request: Request,
    db: Session = Depends(get_db),
):
    url = db.query(Url).filter(Url.short_code == short_code).first()
    if not url:
        raise HTTPException(404, "URL not found")

    db.add(
        Click(
            url_id=url.id,
            referrer=request.headers.get("referer"),
            user_agent=request.headers.get("user-agent"),
        )
    )
    db.commit()
    return RedirectResponse(url.original_url, status_code=307)