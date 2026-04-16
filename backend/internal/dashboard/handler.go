package dashboard

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

type StatusCount struct {
	Status string `json:"status"`
	Count  int64  `json:"count"`
}

type PriorityCount struct {
	Priority string `json:"priority"`
	Count    int64  `json:"count"`
}

func (h *Handler) Metrics(c *gin.Context) {
	var total int64
	h.db.Model(&database.Requirement{}).Count(&total)

	var byStatus []StatusCount
	h.db.Model(&database.Requirement{}).
		Select("status, COUNT(*) as count").
		Group("status").
		Scan(&byStatus)

	var byPriority []PriorityCount
	h.db.Model(&database.Requirement{}).
		Select("priority, COUNT(*) as count").
		Group("priority").
		Scan(&byPriority)

	var approved, inReview, criticalOpen int64
	h.db.Model(&database.Requirement{}).Where("status = ?", "approved").Count(&approved)
	h.db.Model(&database.Requirement{}).Where("status = ?", "review").Count(&inReview)
	h.db.Model(&database.Requirement{}).Where("priority = ? AND status != ?", "critical", "approved").Count(&criticalOpen)

	var recentActivity []database.ActivityLog
	h.db.Preload("Actor").Preload("Requirement").
		Order("created_at DESC").Limit(10).
		Find(&recentActivity)

	// Include requirement title in activity
	type ActivityWithTitle struct {
		database.ActivityLog
		RequirementTitle string `json:"requirement_title"`
	}

	activitiesWithTitles := make([]map[string]interface{}, 0)
	for _, a := range recentActivity {
		var req database.Requirement
		h.db.Select("title").First(&req, "id = ?", a.RequirementID)
		activitiesWithTitles = append(activitiesWithTitles, map[string]interface{}{
			"id":                a.ID,
			"requirement_id":    a.RequirementID,
			"requirement_title": req.Title,
			"actor":             a.Actor,
			"action":            a.Action,
			"meta":              a.Meta,
			"created_at":        a.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"total":          total,
		"approved":       approved,
		"in_review":      inReview,
		"critical_open":  criticalOpen,
		"by_status":      byStatus,
		"by_priority":    byPriority,
		"recent_activity": activitiesWithTitles,
	})
}

func (h *Handler) MyRequirements(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	u := user.(*database.User)

	var reqs []database.Requirement
	h.db.Preload("Tags").Where("assigned_to_id = ? AND status != ?", u.ID, "approved").
		Order("created_at DESC").Limit(5).
		Find(&reqs)

	c.JSON(http.StatusOK, reqs)
}
