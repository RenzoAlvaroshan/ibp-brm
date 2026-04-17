package database

import (
	"log"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) {
	err := db.AutoMigrate(
		&User{},
		&Tag{},
		&Requirement{},
		&Comment{},
		&ActivityLog{},
		&Notification{},
		&App{},
		&Task{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}
	log.Println("Database migrated successfully")
	Seed(db)
}

func Seed(db *gorm.DB) {
	var count int64
	db.Model(&User{}).Count(&count)
	if count > 0 {
		return
	}

	log.Println("Seeding database...")

	adminHash, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	editorHash, _ := bcrypt.GenerateFromPassword([]byte("editor123"), bcrypt.DefaultCost)
	viewerHash, _ := bcrypt.GenerateFromPassword([]byte("viewer123"), bcrypt.DefaultCost)

	adminID := uuid.New()
	editorID := uuid.New()
	viewerID := uuid.New()

	users := []User{
		{
			ID:           adminID,
			Email:        "admin@brm.app",
			PasswordHash: string(adminHash),
			FullName:     "Admin User",
			Role:         RoleAdmin,
			AvatarURL:    "",
		},
		{
			ID:           editorID,
			Email:        "editor@brm.app",
			PasswordHash: string(editorHash),
			FullName:     "Editor User",
			Role:         RoleEditor,
			AvatarURL:    "",
		},
		{
			ID:           viewerID,
			Email:        "viewer@brm.app",
			PasswordHash: string(viewerHash),
			FullName:     "Viewer User",
			Role:         RoleViewer,
			AvatarURL:    "",
		},
	}
	db.Create(&users)

	tags := []Tag{
		{ID: uuid.New(), Name: "Frontend", Color: "#6366F1"},
		{ID: uuid.New(), Name: "Backend", Color: "#10B981"},
		{ID: uuid.New(), Name: "Database", Color: "#F59E0B"},
		{ID: uuid.New(), Name: "Security", Color: "#EF4444"},
		{ID: uuid.New(), Name: "Performance", Color: "#3B82F6"},
	}
	db.Create(&tags)

	dueDate := time.Now().AddDate(0, 1, 0)
	reqs := []Requirement{
		{
			ID:          uuid.New(),
			Title:       "User Authentication System",
			Description: "Implement secure JWT-based authentication with refresh tokens, role-based access control, and password reset functionality.",
			Status:      StatusApproved,
			Priority:    PriorityCritical,
			CreatedByID: adminID,
			AssignedToID: &editorID,
			DueDate:     &dueDate,
			Position:    0,
		},
		{
			ID:          uuid.New(),
			Title:       "Dashboard Analytics Integration",
			Description: "Integrate recharts for displaying real-time business metrics including requirement counts, status distribution, and team performance.",
			Status:      StatusReview,
			Priority:    PriorityHigh,
			CreatedByID: editorID,
			AssignedToID: &adminID,
			Position:    1,
		},
		{
			ID:          uuid.New(),
			Title:       "Export to CSV/PDF Feature",
			Description: "Allow users to export requirements list to CSV and PDF formats with applied filters preserved.",
			Status:      StatusDraft,
			Priority:    PriorityMedium,
			CreatedByID: editorID,
			Position:    2,
		},
		{
			ID:          uuid.New(),
			Title:       "Email Notification System",
			Description: "Send email notifications when requirement status changes, new comments are added, or assignments change.",
			Status:      StatusDraft,
			Priority:    PriorityMedium,
			CreatedByID: adminID,
			Position:    3,
		},
		{
			ID:          uuid.New(),
			Title:       "Kanban Board Drag-and-Drop",
			Description: "Implement drag-and-drop functionality for the Kanban board using @dnd-kit. Persist position and status changes to the backend.",
			Status:      StatusReview,
			Priority:    PriorityHigh,
			CreatedByID: editorID,
			AssignedToID: &editorID,
			Position:    4,
		},
		{
			ID:          uuid.New(),
			Title:       "Performance Optimization Review",
			Description: "Review and optimize database queries, add proper indexes, and implement query caching for frequently accessed endpoints.",
			Status:      StatusRejected,
			Priority:    PriorityLow,
			CreatedByID: viewerID,
			Position:    5,
		},
	}
	db.Create(&reqs)

	apps := []App{
		{ID: uuid.New(), Name: "SCOne", Description: "Supply Chain One — end-to-end supply chain management platform."},
		{ID: uuid.New(), Name: "NCX EBIS", Description: "NCX Enterprise Business Intelligence System for analytics and reporting."},
		{ID: uuid.New(), Name: "NCX Retail", Description: "NCX Retail platform for point-of-sale and inventory management."},
		{ID: uuid.New(), Name: "EAI", Description: "Enterprise Application Integration middleware and message broker."},
		{ID: uuid.New(), Name: "OSM", Description: "Order and Service Management platform."},
	}
	db.Create(&apps)

	log.Println("Database seeded successfully")
	log.Println("Default credentials:")
	log.Println("  Admin:  admin@brm.app / admin123")
	log.Println("  Editor: editor@brm.app / editor123")
	log.Println("  Viewer: viewer@brm.app / viewer123")
}
