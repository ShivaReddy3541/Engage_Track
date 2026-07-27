from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from shared.models import User, Post, Comment, Class, Enrollment
from schemas import PostCreate, PostOut, CommentCreate, CommentOut
from dependencies import get_current_user, RoleChecker

router = APIRouter(
    prefix="/classes",
    tags=["Class Wall"]
)

# Helper function for text moderation mock
def moderate_text(text: str) -> tuple[str, str | None]:
    toxic_words = ["spam", "abuse", "cheat", "leak", "hack", "bypass"]
    lower_text = text.lower()
    for word in toxic_words:
        if word in lower_text:
            return "flagged", f"Flagged by AI Moderation Agent: Toxic word '{word}' detected."
    return "approved", None

@router.post("/{class_id}/posts", response_model=PostOut, status_code=status.HTTP_201_CREATED)
def create_post(
    class_id: int,
    post_in: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Creates a post on the class wall. Checked by a lightweight text moderation system."""
    # Verify class exists
    classroom = db.query(Class).filter(Class.id == class_id).first()
    if not classroom:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Classroom not found."
        )
        
    # Verify enrollment/teaching authorization
    if current_user.role == "student":
        enrolled = db.query(Enrollment).filter(
            Enrollment.student_id == current_user.id,
            Enrollment.class_id == class_id
        ).first()
        if not enrolled:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You must be enrolled in this class to post on its wall."
            )
    elif current_user.role == "teacher":
        if classroom.teacher_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to post in this class."
            )
            
    # Run content moderation check
    status_flag, reason = moderate_text(post_in.content)
    
    new_post = Post(
        class_id=class_id,
        author_id=current_user.id,
        content=post_in.content,
        attachment_url=post_in.attachment_url,
        moderation_status=status_flag,
        flagged_reason=reason
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post

@router.get("/{class_id}/posts", response_model=List[PostOut])
def get_posts(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves approved posts on the class wall (Teachers can see pending/flagged posts too)."""
    # Verify authorization
    classroom = db.query(Class).filter(Class.id == class_id).first()
    if not classroom:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Classroom not found."
        )
        
    if current_user.role == "student":
        enrolled = db.query(Enrollment).filter(
            Enrollment.student_id == current_user.id,
            Enrollment.class_id == class_id
        ).first()
        if not enrolled:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You must be enrolled to view this class wall."
            )
        # Students only see approved posts
        posts = db.query(Post).filter(
            Post.class_id == class_id,
            Post.moderation_status == "approved"
        ).order_by(Post.created_at.desc()).all()
    else:
        # Teachers and Admins see all posts
        posts = db.query(Post).filter(Post.class_id == class_id).order_by(Post.created_at.desc()).all()
        
    return posts

@router.post("/posts/{post_id}/comments", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
def create_comment(
    post_id: int,
    comment_in: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Adds a comment to a class post, moderate-checked on submit."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found."
        )
        
    status_flag, reason = moderate_text(comment_in.content)
    
    new_comment = Comment(
        post_id=post_id,
        author_id=current_user.id,
        content=comment_in.content,
        moderation_status=status_flag,
        flagged_reason=reason
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment
