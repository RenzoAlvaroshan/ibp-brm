package tags

import (
	"net/http"

	"github.com/brm-app/backend/pkg/database"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Handler struct {
	db *gorm.DB
}

func NewHandler(db *gorm.DB) *Handler {
	return &Handler{db: db}
}

type CreateTagRequest struct {
	Name  string `json:"name" binding:"required"`
	Color string `json:"color" binding:"required"`
}

func (h *Handler) List(c *gin.Context) {
	var tags []database.Tag
	h.db.Find(&tags)
	c.JSON(http.StatusOK, tags)
}

func (h *Handler) Create(c *gin.Context) {
	var req CreateTagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(), "code": "VALIDATION_ERROR"})
		return
	}

	tag := database.Tag{Name: req.Name, Color: req.Color}
	if err := h.db.Create(&tag).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "tag name already exists", "code": "CONFLICT"})
		return
	}

	c.JSON(http.StatusCreated, tag)
}

func (h *Handler) Delete(c *gin.Context) {
	id := c.Param("id")
	var tag database.Tag
	if err := h.db.First(&tag, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "tag not found", "code": "NOT_FOUND"})
		return
	}
	h.db.Model(&tag).Association("Requirements").Clear()
	h.db.Delete(&tag)
	c.JSON(http.StatusOK, gin.H{"message": "tag deleted"})
}
