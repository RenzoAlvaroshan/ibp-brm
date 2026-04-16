package requirements

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/brm-app/backend/internal/notifications"
	"github.com/brm-app/backend/pkg/config"
	"github.com/brm-app/backend/pkg/database"
	"github.com/brm-app/backend/pkg/middleware"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Handler struct {
	db   *gorm.DB
	cfg  *config.Config
	notif *notifications.Service
}

func NewHandler(db *gorm.DB, cfg *config.Config, notif *notifications.Service) *Handler {
	return &Handler{db: db, cfg: cfg, notif: notif}
}

type CreateRequest struct {
	Title        string     `json:"title" binding:"required"`
	Description  string     `json:"description"`
	Status       string     `json:"status"`
	Priority     string     `json:"priority"`
	AssignedToID *string    `json:"assigned_to_id"`
	DueDate      *time.Time `json:"due_date"`
	TagIDs       []string   `json:"tag_ids"`
}

type UpdateRequest struct {
	Title        *string    `json:"title"`
	Description  *string    `json:"description"`
	Status       *string    `json:"status"`
	Priority     *string    `json:"priority"`
	AssignedToID *string    `json:"assigned_to_id"`
	DueDate      *time.Time `json:"due_date"`
	TagIDs       []string   `json:"tag_ids"`
	Position     *int       `json:"position"`
}

type ReorderRequest struct {
	Items []ReorderItem `json:"items" binding:"required"`
}

type ReorderItem struct {
	ID       string `json:"id"`
	Position int    `json:"position"`
	Status   string `json:"status"`
}

func (h *Handler) List(c *gin.Context) {
	query := h.db.Model(&database.Requirement{}).
		Preload("CreatedBy").
		Preload("AssignedTo").
		Preload("Tags")

	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if priority := c.Query("priority"); priority != "" {
		query = query.Where("priority = ?", priority)
	}
	if search := c.Query("search"); search != "" {
		query = query.Where("title ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%")
	}
	if assignee := c.Query("assignee"); assignee != "" {
		query = query.Where("assigned_to_id = ?", assignee)
	}
	if tagID := c.Query("tag"); tagID != "" {
		query = query.Joins("JOIN requirement_tags rt ON rt.requirement_id = requirements.id").
			Where("rt.tag_id = ?", tagID)
	}
	if createdBy := c.Query("created_by"); createdBy != "" {
		query = query.Where("created_by_id = ?", createdBy)
	}

	sortField := c.DefaultQuery("sort", "created_at")
	sortDir := c.DefaultQuery("dir", "desc")
	allowedSorts := map[string]bool{"created_at": true, "updated_at": true, "priority": true, "due_date": true, "title": true, "position": true}
	if !allowedSorts[sortField] {
		sortField = "created_at"
	}
	if sortDir != "asc" && sortDir != "desc" {
		sortDir = "desc"
	}
	query = query.Order(sortField + " " + sortDir)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 50
	}
	offset := (page - 1) * limit

	var total int64
	query.Count(&total)

	var reqs []database.Requirement
	query.Offset(offset).Limit(limit).Find(&reqs)

	c.JSON(http.StatusOK, gin.H{
		"data":  reqs,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

func (h *Handler) Create(c *gin.Context) {
	currentUser := middleware.GetCurrentUser(c)
	if currentUser == nil {
		return
	}

	var req CreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(), "code": "VALIDATION_ERROR"})
		return
	}

	requirement := database.Requirement{
		Title:       req.Title,
		Description: req.Description,
		Status:      database.StatusDraft,
		Priority:    database.PriorityMedium,
		CreatedByID: currentUser.ID,
		DueDate:     req.DueDate,
	}

	if req.Status != "" {
		requirement.Status = database.Status(req.Status)
	}
	if req.Priority != "" {
		requirement.Priority = database.Priority(req.Priority)
	}
	if req.AssignedToID != nil && *req.AssignedToID != "" {
		assignedID, err := uuid.Parse(*req.AssignedToID)
		if err == nil {
			requirement.AssignedToID = &assignedID
		}
	}

	if err := h.db.Create(&requirement).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create requirement", "code": "INTERNAL_ERROR"})
		return
	}

	if len(req.TagIDs) > 0 {
		var tags []database.Tag
		h.db.Where("id IN ?", req.TagIDs).Find(&tags)
		h.db.Model(&requirement).Association("Tags").Replace(tags)
	}

	h.logActivity(requirement.ID, currentUser.ID, "created", map[string]interface{}{
		"title": requirement.Title,
	})

	h.db.Preload("CreatedBy").Preload("AssignedTo").Preload("Tags").First(&requirement)
	c.JSON(http.StatusCreated, requirement)
}

func (h *Handler) Get(c *gin.Context) {
	id := c.Param("id")
	var req database.Requirement
	if err := h.db.Preload("CreatedBy").Preload("AssignedTo").Preload("Tags").
		Preload("Comments", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at ASC")
		}).
		Preload("Comments.Author").
		First(&req, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "requirement not found", "code": "NOT_FOUND"})
		return
	}
	c.JSON(http.StatusOK, req)
}

func (h *Handler) Update(c *gin.Context) {
	currentUser := middleware.GetCurrentUser(c)
	if currentUser == nil {
		return
	}

	id := c.Param("id")
	var req database.Requirement
	if err := h.db.Preload("Tags").First(&req, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "requirement not found", "code": "NOT_FOUND"})
		return
	}

	if currentUser.Role == database.RoleEditor && req.CreatedByID != currentUser.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "you can only edit your own requirements", "code": "FORBIDDEN"})
		return
	}

	var body UpdateRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(), "code": "VALIDATION_ERROR"})
		return
	}

	oldStatus := req.Status
	updates := map[string]interface{}{}

	if body.Title != nil {
		updates["title"] = *body.Title
	}
	if body.Description != nil {
		updates["description"] = *body.Description
	}
	if body.Status != nil {
		updates["status"] = *body.Status
	}
	if body.Priority != nil {
		updates["priority"] = *body.Priority
	}
	if body.DueDate != nil {
		updates["due_date"] = body.DueDate
	}
	if body.Position != nil {
		updates["position"] = *body.Position
	}
	if body.AssignedToID != nil {
		if *body.AssignedToID == "" {
			updates["assigned_to_id"] = nil
		} else {
			uid, err := uuid.Parse(*body.AssignedToID)
			if err == nil {
				updates["assigned_to_id"] = uid
			}
		}
	}

	h.db.Model(&req).Updates(updates)

	if body.TagIDs != nil {
		var tags []database.Tag
		if len(body.TagIDs) > 0 {
			h.db.Where("id IN ?", body.TagIDs).Find(&tags)
		}
		h.db.Model(&req).Association("Tags").Replace(tags)
	}

	if body.Status != nil && database.Status(*body.Status) != oldStatus {
		h.logActivity(req.ID, currentUser.ID, "status_changed", map[string]interface{}{
			"from": oldStatus,
			"to":   *body.Status,
		})
		go h.notif.NotifyStatusChange(&req, currentUser, string(oldStatus), *body.Status)
	}

	h.db.Preload("CreatedBy").Preload("AssignedTo").Preload("Tags").First(&req)
	c.JSON(http.StatusOK, req)
}

func (h *Handler) Delete(c *gin.Context) {
	currentUser := middleware.GetCurrentUser(c)
	if currentUser == nil {
		return
	}

	id := c.Param("id")
	var req database.Requirement
	if err := h.db.First(&req, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "requirement not found", "code": "NOT_FOUND"})
		return
	}

	if currentUser.Role == database.RoleEditor && req.CreatedByID != currentUser.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "you can only delete your own requirements", "code": "FORBIDDEN"})
		return
	}

	now := time.Now()
	h.db.Model(&req).Update("deleted_at", now)
	c.JSON(http.StatusOK, gin.H{"message": "requirement deleted successfully"})
}

func (h *Handler) Reorder(c *gin.Context) {
	var req ReorderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(), "code": "VALIDATION_ERROR"})
		return
	}

	for _, item := range req.Items {
		updates := map[string]interface{}{"position": item.Position}
		if item.Status != "" {
			updates["status"] = item.Status
		}
		h.db.Model(&database.Requirement{}).Where("id = ?", item.ID).Updates(updates)
	}

	c.JSON(http.StatusOK, gin.H{"message": "reordered successfully"})
}

func (h *Handler) ExportCSV(c *gin.Context) {
	query := h.db.Model(&database.Requirement{}).
		Preload("CreatedBy").Preload("AssignedTo").Preload("Tags")

	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if priority := c.Query("priority"); priority != "" {
		query = query.Where("priority = ?", priority)
	}

	var reqs []database.Requirement
	query.Find(&reqs)

	c.Header("Content-Disposition", "attachment; filename=requirements.csv")
	c.Header("Content-Type", "text/csv")

	c.Writer.WriteString("ID,Title,Status,Priority,AssignedTo,DueDate,CreatedAt\n")
	for _, r := range reqs {
		assignedTo := ""
		if r.AssignedTo != nil {
			assignedTo = r.AssignedTo.FullName
		}
		dueDate := ""
		if r.DueDate != nil {
			dueDate = r.DueDate.Format("2006-01-02")
		}
		c.Writer.WriteString(r.ID.String() + "," +
			escapeCsv(r.Title) + "," +
			string(r.Status) + "," +
			string(r.Priority) + "," +
			escapeCsv(assignedTo) + "," +
			dueDate + "," +
			r.CreatedAt.Format("2006-01-02") + "\n")
	}
}

func escapeCsv(s string) string {
	for _, ch := range s {
		if ch == ',' || ch == '"' || ch == '\n' {
			return `"` + s + `"`
		}
	}
	return s
}

func (h *Handler) logActivity(reqID, actorID uuid.UUID, action string, meta map[string]interface{}) {
	metaJSON, _ := json.Marshal(meta)
	log := database.ActivityLog{
		RequirementID: reqID,
		ActorID:       actorID,
		Action:        action,
		Meta:          string(metaJSON),
	}
	h.db.Create(&log)
}
