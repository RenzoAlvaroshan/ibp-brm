package comments

import (
	"encoding/json"
	"net/http"

	"github.com/brm-app/backend/pkg/database"
	"github.com/brm-app/backend/pkg/middleware"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Handler struct {
	db *gorm.DB
}

func NewHandler(db *gorm.DB) *Handler {
	return &Handler{db: db}
}

type CreateCommentRequest struct {
	Body string `json:"body" binding:"required"`
}

func (h *Handler) ListComments(c *gin.Context) {
	reqID := c.Param("id")
	var comments []database.Comment
	h.db.Preload("Author").Where("requirement_id = ?", reqID).Order("created_at ASC").Find(&comments)
	c.JSON(http.StatusOK, comments)
}

func (h *Handler) CreateComment(c *gin.Context) {
	currentUser := middleware.GetCurrentUser(c)
	if currentUser == nil {
		return
	}

	reqID := c.Param("id")
	requirementID, err := uuid.Parse(reqID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid requirement id", "code": "BAD_REQUEST"})
		return
	}

	var req CreateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(), "code": "VALIDATION_ERROR"})
		return
	}

	comment := database.Comment{
		RequirementID: requirementID,
		AuthorID:      currentUser.ID,
		Body:          req.Body,
	}

	if err := h.db.Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create comment", "code": "INTERNAL_ERROR"})
		return
	}

	metaJSON, _ := json.Marshal(map[string]interface{}{"comment_id": comment.ID})
	activity := database.ActivityLog{
		RequirementID: requirementID,
		ActorID:       currentUser.ID,
		Action:        "comment_added",
		Meta:          string(metaJSON),
	}
	h.db.Create(&activity)

	h.db.Preload("Author").First(&comment)
	c.JSON(http.StatusCreated, comment)
}

func (h *Handler) DeleteComment(c *gin.Context) {
	currentUser := middleware.GetCurrentUser(c)
	if currentUser == nil {
		return
	}

	id := c.Param("id")
	var comment database.Comment
	if err := h.db.First(&comment, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "comment not found", "code": "NOT_FOUND"})
		return
	}

	if comment.AuthorID != currentUser.ID && currentUser.Role != database.RoleAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "you can only delete your own comments", "code": "FORBIDDEN"})
		return
	}

	h.db.Delete(&comment)
	c.JSON(http.StatusOK, gin.H{"message": "comment deleted"})
}

func (h *Handler) ListActivity(c *gin.Context) {
	reqID := c.Param("id")
	var activities []database.ActivityLog
	h.db.Preload("Actor").Where("requirement_id = ?", reqID).Order("created_at DESC").Limit(50).Find(&activities)
	c.JSON(http.StatusOK, activities)
}
