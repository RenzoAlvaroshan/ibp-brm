package dashboard

import (
	"net/http"
	"strings"

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

// filteredBase returns a *gorm.DB with all active dashboard filters applied.
func (h *Handler) filteredBase(c *gin.Context) *gorm.DB {
	q := h.db.Model(&database.Requirement{})

	if from := c.Query("from_date"); from != "" {
		q = q.Where("requirements.created_at >= ?", from+" 00:00:00")
	}
	if to := c.Query("to_date"); to != "" {
		q = q.Where("requirements.created_at <= ?", to+" 23:59:59")
	}
	if s := c.Query("statuses"); s != "" {
		q = q.Where("requirements.status IN ?", strings.Split(s, ","))
	}
	if p := c.Query("priorities"); p != "" {
		q = q.Where("requirements.priority IN ?", strings.Split(p, ","))
	}
	if t := c.Query("tag_ids"); t != "" {
		q = q.Where(
			"requirements.id IN (SELECT requirement_id FROM requirement_tags WHERE tag_id IN ?)",
			strings.Split(t, ","),
		)
	}
	return q
}

func (h *Handler) Metrics(c *gin.Context) {
	base := h.filteredBase(c)

	var total int64
	base.Count(&total)

	var byStatus []StatusCount
	base.Select("status, COUNT(*) as count").Group("status").Scan(&byStatus)

	var byPriority []PriorityCount
	base.Select("priority, COUNT(*) as count").Group("priority").Scan(&byPriority)

	var approved, inReview, criticalOpen int64
	base.Where("status = ?", "completed").Count(&approved)
	base.Where("status IN ?", []string{"development", "sit", "uat"}).Count(&inReview)
	base.Where("priority = ? AND status != ?", "critical", "completed").Count(&criticalOpen)

	var recentActivity []database.ActivityLog
	h.db.Preload("Actor").Preload("Requirement").
		Order("created_at DESC").Limit(10).
		Find(&recentActivity)

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
		"total":           total,
		"approved":        approved,
		"in_review":       inReview,
		"critical_open":   criticalOpen,
		"by_status":       byStatus,
		"by_priority":     byPriority,
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
	h.db.Preload("Tags").Where("assigned_to_id = ? AND status != ?", u.ID, "completed").
		Order("created_at DESC").Limit(5).
		Find(&reqs)

	c.JSON(http.StatusOK, reqs)
}
