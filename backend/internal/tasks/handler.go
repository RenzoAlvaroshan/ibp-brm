package tasks

import (
	"net/http"
	"time"

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

type CreateTaskRequest struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
	Status      string `json:"status"`
	TargetDate  *string `json:"target_date"`
	AppID       *string `json:"app_id"`
}

type UpdateTaskRequest struct {
	Title       *string `json:"title"`
	Description *string `json:"description"`
	Status      *string `json:"status"`
	TargetDate  *string `json:"target_date"`
	AppID       *string `json:"app_id"`
}

func (h *Handler) List(c *gin.Context) {
	reqID := c.Param("id")
	var tasks []database.Task
	if err := h.db.Preload("App").Where("requirement_id = ?", reqID).Order("created_at ASC").Find(&tasks).Error; err != nil {
		c.JSON(http.StatusOK, []database.Task{})
		return
	}
	if tasks == nil {
		tasks = []database.Task{}
	}
	c.JSON(http.StatusOK, tasks)
}

func (h *Handler) ListAll(c *gin.Context) {
	var tasks []database.Task
	query := h.db.Preload("App").Preload("Requirement")

	if status := c.Query("status"); status != "" {
		query = query.Where("tasks.status = ?", status)
	}
	if appID := c.Query("app_id"); appID != "" {
		query = query.Where("tasks.app_id = ?", appID)
	}
	if search := c.Query("search"); search != "" {
		query = query.Where("tasks.title ILIKE ?", "%"+search+"%")
	}

	query.Order("target_date ASC NULLS LAST, tasks.created_at ASC").Find(&tasks)
	c.JSON(http.StatusOK, tasks)
}

func (h *Handler) Create(c *gin.Context) {
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

	var req CreateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(), "code": "VALIDATION_ERROR"})
		return
	}

	task := database.Task{
		RequirementID: requirementID,
		Title:         req.Title,
		Description:   req.Description,
		Status:        database.TaskStatusTodo,
	}

	if req.Status != "" {
		task.Status = database.TaskStatus(req.Status)
	}

	if req.TargetDate != nil && *req.TargetDate != "" {
		t, err := time.Parse("2006-01-02", *req.TargetDate)
		if err == nil {
			task.TargetDate = &t
		}
	}

	if req.AppID != nil && *req.AppID != "" {
		appID, err := uuid.Parse(*req.AppID)
		if err == nil {
			task.AppID = &appID
		}
	}

	if err := h.db.Create(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create task", "code": "INTERNAL_ERROR"})
		return
	}

	h.db.Preload("App").Preload("App.Users").First(&task)
	c.JSON(http.StatusCreated, task)
}

func (h *Handler) Update(c *gin.Context) {
	currentUser := middleware.GetCurrentUser(c)
	if currentUser == nil {
		return
	}

	id := c.Param("id")
	var task database.Task
	if err := h.db.First(&task, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "task not found", "code": "NOT_FOUND"})
		return
	}

	var req UpdateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(), "code": "VALIDATION_ERROR"})
		return
	}

	updates := map[string]interface{}{}
	if req.Title != nil {
		updates["title"] = *req.Title
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.Status != nil {
		updates["status"] = *req.Status
	}
	if req.TargetDate != nil {
		if *req.TargetDate == "" {
			updates["target_date"] = nil
		} else if t, err := time.Parse("2006-01-02", *req.TargetDate); err == nil {
			updates["target_date"] = t
		}
	}
	if req.AppID != nil {
		if *req.AppID == "" {
			updates["app_id"] = nil
		} else if appID, err := uuid.Parse(*req.AppID); err == nil {
			updates["app_id"] = appID
		}
	}

	h.db.Model(&task).Updates(updates)
	h.db.Preload("App").Preload("App.Users").First(&task)
	c.JSON(http.StatusOK, task)
}

func (h *Handler) Delete(c *gin.Context) {
	currentUser := middleware.GetCurrentUser(c)
	if currentUser == nil {
		return
	}

	id := c.Param("id")
	var task database.Task
	if err := h.db.First(&task, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "task not found", "code": "NOT_FOUND"})
		return
	}

	h.db.Delete(&task)
	c.JSON(http.StatusOK, gin.H{"message": "task deleted"})
}
