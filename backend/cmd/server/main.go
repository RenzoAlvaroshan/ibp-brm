package main

import (
	"log"

	"github.com/brm-app/backend/internal/auth"
	"github.com/brm-app/backend/internal/comments"
	"github.com/brm-app/backend/internal/dashboard"
	"github.com/brm-app/backend/internal/notifications"
	"github.com/brm-app/backend/internal/requirements"
	"github.com/brm-app/backend/internal/tags"
	"github.com/brm-app/backend/internal/users"
	"github.com/brm-app/backend/pkg/config"
	"github.com/brm-app/backend/pkg/database"
	"github.com/brm-app/backend/pkg/middleware"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	cfg := config.Load()

	db := database.Connect(cfg)
	database.Migrate(db)

	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()
	r.Use(middleware.CORS(cfg))

	// Services
	notifService := notifications.NewService(db, cfg)

	// Handlers
	authHandler := auth.NewHandler(db, cfg)
	reqHandler := requirements.NewHandler(db, cfg, notifService)
	commentHandler := comments.NewHandler(db)
	tagHandler := tags.NewHandler(db)
	userHandler := users.NewHandler(db)
	dashHandler := dashboard.NewHandler(db)
	notifHandler := notifications.NewHandler(db)

	api := r.Group("/api")

	// Auth routes
	authGroup := api.Group("/auth")
	{
		authGroup.POST("/register", authHandler.Register)
		authGroup.POST("/login", authHandler.Login)
		authGroup.POST("/refresh", authHandler.Refresh)
		authGroup.POST("/logout", middleware.AuthRequired(cfg), authHandler.Logout)
		authGroup.GET("/me", middleware.AuthRequired(cfg), authHandler.Me)
		authGroup.PUT("/profile", middleware.AuthRequired(cfg), authHandler.UpdateProfile)
		authGroup.POST("/change-password", middleware.AuthRequired(cfg), authHandler.ChangePassword)
	}

	// Protected routes
	protected := api.Group("", middleware.AuthRequired(cfg))

	// Requirements
	reqs := protected.Group("/requirements")
	{
		reqs.GET("", reqHandler.List)
		reqs.POST("", middleware.RequireRole(database.RoleAdmin, database.RoleEditor), reqHandler.Create)
		reqs.GET("/export/csv", reqHandler.ExportCSV)
		reqs.PATCH("/reorder", reqHandler.Reorder)
		reqs.GET("/:id", reqHandler.Get)
		reqs.PUT("/:id", middleware.RequireRole(database.RoleAdmin, database.RoleEditor), reqHandler.Update)
		reqs.PATCH("/:id", middleware.RequireRole(database.RoleAdmin, database.RoleEditor), reqHandler.Update)
		reqs.DELETE("/:id", middleware.RequireRole(database.RoleAdmin, database.RoleEditor), reqHandler.Delete)
		reqs.GET("/:id/comments", commentHandler.ListComments)
		reqs.POST("/:id/comments", middleware.RequireRole(database.RoleAdmin, database.RoleEditor), commentHandler.CreateComment)
		reqs.GET("/:id/activity", commentHandler.ListActivity)
	}

	// Comments
	protected.DELETE("/comments/:id", commentHandler.DeleteComment)

	// Tags
	tagGroup := protected.Group("/tags")
	{
		tagGroup.GET("", tagHandler.List)
		tagGroup.POST("", middleware.RequireRole(database.RoleAdmin, database.RoleEditor), tagHandler.Create)
		tagGroup.DELETE("/:id", middleware.RequireRole(database.RoleAdmin, database.RoleEditor), tagHandler.Delete)
	}

	// Users (admin only)
	userGroup := protected.Group("/users")
	{
		userGroup.GET("", middleware.RequireRole(database.RoleAdmin), userHandler.List)
		userGroup.PATCH("/:id/role", middleware.RequireRole(database.RoleAdmin), userHandler.UpdateRole)
		userGroup.POST("/invite", middleware.RequireRole(database.RoleAdmin), userHandler.Invite)
	}

	// Dashboard
	dashGroup := protected.Group("/dashboard")
	{
		dashGroup.GET("/metrics", dashHandler.Metrics)
		dashGroup.GET("/my-requirements", dashHandler.MyRequirements)
	}

	// Notifications
	notifGroup := protected.Group("/notifications")
	{
		notifGroup.GET("", notifHandler.List)
		notifGroup.PATCH("/:id/read", notifHandler.MarkRead)
		notifGroup.PATCH("/read-all", notifHandler.MarkAllRead)
	}

	log.Printf("Server starting on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// Ensure database package is imported for Role constants
var _ = database.RoleAdmin
