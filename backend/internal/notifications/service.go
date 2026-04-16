package notifications

import (
	"fmt"
	"log"
	"net/http"
	"net/smtp"

	"github.com/brm-app/backend/pkg/config"
	"github.com/brm-app/backend/pkg/database"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Service struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewService(db *gorm.DB, cfg *config.Config) *Service {
	return &Service{db: db, cfg: cfg}
}

func (s *Service) NotifyStatusChange(req *database.Requirement, actor *database.User, from, to string) {
	var usersToNotify []database.User

	if req.AssignedToID != nil && *req.AssignedToID != actor.ID {
		var assignee database.User
		if err := s.db.First(&assignee, "id = ?", req.AssignedToID).Error; err == nil {
			usersToNotify = append(usersToNotify, assignee)
		}
	}

	var creator database.User
	if err := s.db.First(&creator, "id = ?", req.CreatedByID).Error; err == nil {
		if creator.ID != actor.ID {
			usersToNotify = append(usersToNotify, creator)
		}
	}

	message := fmt.Sprintf(`Requirement "%s" status changed from %s to %s by %s`, req.Title, from, to, actor.FullName)
	link := fmt.Sprintf("/requirements?id=%s", req.ID.String())

	for _, user := range usersToNotify {
		notif := database.Notification{
			UserID:  user.ID,
			Message: message,
			Link:    link,
		}
		s.db.Create(&notif)

		if user.Email != "" && s.cfg.SMTPUser != "" {
			go s.sendEmail(user.Email, "Requirement Status Changed", message)
		}
	}
}

func (s *Service) sendEmail(to, subject, body string) {
	if s.cfg.SMTPUser == "" {
		return
	}
	auth := smtp.PlainAuth("", s.cfg.SMTPUser, s.cfg.SMTPPassword, s.cfg.SMTPHost)
	msg := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s", s.cfg.SMTPFrom, to, subject, body)
	addr := fmt.Sprintf("%s:%d", s.cfg.SMTPHost, s.cfg.SMTPPort)
	if err := smtp.SendMail(addr, auth, s.cfg.SMTPFrom, []string{to}, []byte(msg)); err != nil {
		log.Printf("Failed to send email to %s: %v", to, err)
	}
}

type Handler struct {
	db *gorm.DB
}

func NewHandler(db *gorm.DB) *Handler {
	return &Handler{db: db}
}

func (h *Handler) List(c *gin.Context) {
	user := getUser(c)
	if user == nil {
		return
	}

	var notifications []database.Notification
	h.db.Where("user_id = ?", user.ID).Order("created_at DESC").Limit(50).Find(&notifications)

	var unread int64
	h.db.Model(&database.Notification{}).Where("user_id = ? AND is_read = false", user.ID).Count(&unread)

	c.JSON(http.StatusOK, gin.H{
		"notifications": notifications,
		"unread_count":  unread,
	})
}

func (h *Handler) MarkRead(c *gin.Context) {
	user := getUser(c)
	if user == nil {
		return
	}

	id := c.Param("id")
	h.db.Model(&database.Notification{}).
		Where("id = ? AND user_id = ?", id, user.ID).
		Update("is_read", true)
	c.JSON(http.StatusOK, gin.H{"message": "marked as read"})
}

func (h *Handler) MarkAllRead(c *gin.Context) {
	user := getUser(c)
	if user == nil {
		return
	}

	h.db.Model(&database.Notification{}).
		Where("user_id = ?", user.ID).
		Update("is_read", true)
	c.JSON(http.StatusOK, gin.H{"message": "all marked as read"})
}

func getUser(c *gin.Context) *database.User {
	u, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized", "code": "UNAUTHORIZED"})
		return nil
	}
	return u.(*database.User)
}
