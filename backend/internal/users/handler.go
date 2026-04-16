package users

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

type UpdateRoleRequest struct {
	Role string `json:"role" binding:"required"`
}

func (h *Handler) List(c *gin.Context) {
	var users []database.User
	h.db.Select("id, email, full_name, role, avatar_url, created_at").Find(&users)
	c.JSON(http.StatusOK, users)
}

func (h *Handler) UpdateRole(c *gin.Context) {
	id := c.Param("id")
	var req UpdateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(), "code": "VALIDATION_ERROR"})
		return
	}

	validRoles := map[string]bool{"admin": true, "editor": true, "viewer": true}
	if !validRoles[req.Role] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid role", "code": "VALIDATION_ERROR"})
		return
	}

	var user database.User
	if err := h.db.First(&user, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found", "code": "NOT_FOUND"})
		return
	}

	h.db.Model(&user).Update("role", req.Role)
	c.JSON(http.StatusOK, user)
}

type InviteRequest struct {
	Email    string `json:"email" binding:"required,email"`
	FullName string `json:"full_name" binding:"required"`
	Role     string `json:"role"`
}

func (h *Handler) Invite(c *gin.Context) {
	var req InviteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(), "code": "VALIDATION_ERROR"})
		return
	}

	// In a real app, this would send an invite email
	c.JSON(http.StatusOK, gin.H{"message": "invitation sent to " + req.Email})
}
