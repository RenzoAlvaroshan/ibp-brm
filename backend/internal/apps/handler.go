package apps

import (
	"net/http"

	"github.com/brm-app/backend/pkg/database"
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

type CreateAppRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

type UpdateAppRequest struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
}

func (h *Handler) List(c *gin.Context) {
	var apps []database.App
	h.db.Preload("Users").Find(&apps)
	c.JSON(http.StatusOK, apps)
}

func (h *Handler) Create(c *gin.Context) {
	var req CreateAppRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(), "code": "VALIDATION_ERROR"})
		return
	}

	app := database.App{Name: req.Name, Description: req.Description}
	if err := h.db.Create(&app).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "app name already exists", "code": "CONFLICT"})
		return
	}

	h.db.Preload("Users").First(&app)
	c.JSON(http.StatusCreated, app)
}

func (h *Handler) Update(c *gin.Context) {
	id := c.Param("id")
	var app database.App
	if err := h.db.First(&app, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "app not found", "code": "NOT_FOUND"})
		return
	}

	var req UpdateAppRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(), "code": "VALIDATION_ERROR"})
		return
	}

	updates := map[string]interface{}{}
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}

	h.db.Model(&app).Updates(updates)
	h.db.Preload("Users").First(&app)
	c.JSON(http.StatusOK, app)
}

func (h *Handler) Delete(c *gin.Context) {
	id := c.Param("id")
	var app database.App
	if err := h.db.First(&app, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "app not found", "code": "NOT_FOUND"})
		return
	}
	h.db.Model(&app).Association("Users").Clear()
	h.db.Delete(&app)
	c.JSON(http.StatusOK, gin.H{"message": "app deleted"})
}

func (h *Handler) AddUser(c *gin.Context) {
	appID := c.Param("id")
	var app database.App
	if err := h.db.First(&app, "id = ?", appID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "app not found", "code": "NOT_FOUND"})
		return
	}

	var body struct {
		UserID string `json:"user_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(), "code": "VALIDATION_ERROR"})
		return
	}

	userID, err := uuid.Parse(body.UserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id", "code": "BAD_REQUEST"})
		return
	}

	var user database.User
	if err := h.db.First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found", "code": "NOT_FOUND"})
		return
	}

	h.db.Model(&app).Association("Users").Append(&user)
	h.db.Preload("Users").First(&app)
	c.JSON(http.StatusOK, app)
}

func (h *Handler) RemoveUser(c *gin.Context) {
	appID := c.Param("id")
	userID := c.Param("userId")

	var app database.App
	if err := h.db.First(&app, "id = ?", appID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "app not found", "code": "NOT_FOUND"})
		return
	}

	uid, err := uuid.Parse(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id", "code": "BAD_REQUEST"})
		return
	}

	user := database.User{}
	user.ID = uid
	h.db.Model(&app).Association("Users").Delete(&user)
	h.db.Preload("Users").First(&app)
	c.JSON(http.StatusOK, app)
}
