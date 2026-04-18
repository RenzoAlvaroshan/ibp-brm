package dashboard

import (
	"net/http"
	"strings"
	"time"

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

type TagCount struct {
	TagID   string `json:"tag_id"`
	TagName string `json:"tag_name"`
	Color   string `json:"color"`
	Count   int64  `json:"count"`
}

type AssigneeCount struct {
	UserID   string `json:"user_id"`
	FullName string `json:"full_name"`
	Count    int64  `json:"count"`
}

type WeeklyCount struct {
	Week  string `json:"week"`
	Count int64  `json:"count"`
}

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

	now := time.Now()
	today := now.Format("2006-01-02")
	weekLater := now.AddDate(0, 0, 7).Format("2006-01-02")

	// ── Scalar counts ─────────────────────────────────────────────────────────
	var total, approved, inReview, criticalOpen, overdue, dueThisWeek int64
	base.Count(&total)
	base.Where("status = ?", "completed").Count(&approved)
	base.Where("status IN ?", []string{"development", "sit", "uat"}).Count(&inReview)
	base.Where("priority = ? AND status != ?", "critical", "completed").Count(&criticalOpen)
	base.Where("due_date < ? AND status != ?", today, "completed").Count(&overdue)
	base.Where("due_date >= ? AND due_date <= ? AND status != ?", today, weekLater, "completed").Count(&dueThisWeek)

	var openTasks int64
	h.db.Model(&database.Task{}).Where("status != ?", "done").Count(&openTasks)

	// ── Distributions ─────────────────────────────────────────────────────────
	var byStatus []StatusCount
	base.Select("status, COUNT(*) as count").Group("status").Scan(&byStatus)

	var byPriority []PriorityCount
	base.Select("priority, COUNT(*) as count").Group("priority").Scan(&byPriority)

	var byTag []TagCount
	h.db.Raw(`
		SELECT t.id as tag_id, t.name as tag_name, t.color,
		       COUNT(DISTINCT rt.requirement_id) as count
		FROM tags t
		LEFT JOIN requirement_tags rt ON t.id = rt.tag_id
		GROUP BY t.id, t.name, t.color
		ORDER BY count DESC
		LIMIT 8
	`).Scan(&byTag)

	var byAssignee []AssigneeCount
	base.Select("users.id as user_id, users.full_name, COUNT(requirements.id) as count").
		Joins("JOIN users ON requirements.assigned_to_id = users.id").
		Where("requirements.status != ?", "completed").
		Group("users.id, users.full_name").
		Order("count DESC").
		Limit(8).
		Scan(&byAssignee)

	// ── Throughput (weekly completions, last 8 weeks) ─────────────────────────
	var throughput []WeeklyCount
	h.db.Raw(`
		SELECT TO_CHAR(DATE_TRUNC('week', updated_at), 'YYYY-MM-DD') as week,
		       COUNT(*) as count
		FROM requirements
		WHERE status = 'completed'
		  AND updated_at >= NOW() - INTERVAL '8 weeks'
		  AND deleted_at IS NULL
		GROUP BY week
		ORDER BY week
	`).Scan(&throughput)

	// ── Overdue list ──────────────────────────────────────────────────────────
	var overdueList []database.Requirement
	h.db.Preload("AssignedTo").
		Where("due_date < ? AND status != ?", today, "completed").
		Order("due_date ASC").
		Limit(5).
		Find(&overdueList)

	// ── Upcoming deadlines (next 7 days) ──────────────────────────────────────
	var upcomingList []database.Requirement
	h.db.Preload("AssignedTo").
		Where("due_date >= ? AND due_date <= ? AND status != ?", today, weekLater, "completed").
		Order("due_date ASC").
		Limit(5).
		Find(&upcomingList)

	// ── Recent activity ───────────────────────────────────────────────────────
	var recentActivity []database.ActivityLog
	h.db.Preload("Actor").Order("created_at DESC").Limit(10).Find(&recentActivity)

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
		"overdue":         overdue,
		"due_this_week":   dueThisWeek,
		"open_tasks":      openTasks,
		"by_status":       byStatus,
		"by_priority":     byPriority,
		"by_tag":          byTag,
		"by_assignee":     byAssignee,
		"throughput":      throughput,
		"overdue_list":    overdueList,
		"upcoming_list":   upcomingList,
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
