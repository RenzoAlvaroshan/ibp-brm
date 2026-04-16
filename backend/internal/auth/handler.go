package auth

import (
	"net/http"
	"time"

	"github.com/brm-app/backend/pkg/config"
	"github.com/brm-app/backend/pkg/database"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type Handler struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewHandler(db *gorm.DB, cfg *config.Config) *Handler {
	return &Handler{db: db, cfg: cfg}
}

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	FullName string `json:"full_name" binding:"required"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	AccessToken  string         `json:"access_token"`
	RefreshToken string         `json:"refresh_token"`
	User         database.User  `json:"user"`
}

func (h *Handler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(), "code": "VALIDATION_ERROR"})
		return
	}

	var existing database.User
	if err := h.db.Where("email = ?", req.Email).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "email already registered", "code": "EMAIL_EXISTS"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to process password", "code": "INTERNAL_ERROR"})
		return
	}

	user := database.User{
		ID:           uuid.New(),
		Email:        req.Email,
		PasswordHash: string(hash),
		FullName:     req.FullName,
		Role:         database.RoleViewer,
	}

	if err := h.db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user", "code": "INTERNAL_ERROR"})
		return
	}

	accessToken, _ := GenerateToken(user.ID.String(), string(user.Role), h.cfg.JWTSecret, 15*time.Minute)
	refreshToken, _ := GenerateToken(user.ID.String(), string(user.Role), h.cfg.JWTRefreshSecret, 7*24*time.Hour)

	c.JSON(http.StatusCreated, AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         user,
	})
}

func (h *Handler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(), "code": "VALIDATION_ERROR"})
		return
	}

	var user database.User
	if err := h.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials", "code": "INVALID_CREDENTIALS"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials", "code": "INVALID_CREDENTIALS"})
		return
	}

	accessToken, _ := GenerateToken(user.ID.String(), string(user.Role), h.cfg.JWTSecret, 15*time.Minute)
	refreshToken, _ := GenerateToken(user.ID.String(), string(user.Role), h.cfg.JWTRefreshSecret, 7*24*time.Hour)

	c.JSON(http.StatusOK, AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         user,
	})
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

func (h *Handler) Refresh(c *gin.Context) {
	var req RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(), "code": "VALIDATION_ERROR"})
		return
	}

	claims, err := ValidateToken(req.RefreshToken, h.cfg.JWTRefreshSecret)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid refresh token", "code": "UNAUTHORIZED"})
		return
	}

	var user database.User
	if err := h.db.First(&user, "id = ?", claims.UserID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found", "code": "UNAUTHORIZED"})
		return
	}

	accessToken, _ := GenerateToken(user.ID.String(), string(user.Role), h.cfg.JWTSecret, 15*time.Minute)
	newRefresh, _ := GenerateToken(user.ID.String(), string(user.Role), h.cfg.JWTRefreshSecret, 7*24*time.Hour)

	c.JSON(http.StatusOK, gin.H{
		"access_token":  accessToken,
		"refresh_token": newRefresh,
	})
}

func (h *Handler) Me(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized", "code": "UNAUTHORIZED"})
		return
	}
	c.JSON(http.StatusOK, user)
}

func (h *Handler) Logout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "logged out successfully"})
}

type UpdateProfileRequest struct {
	FullName  string `json:"full_name"`
	AvatarURL string `json:"avatar_url"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

func (h *Handler) UpdateProfile(c *gin.Context) {
	currentUser := getCurrentUser(c)
	if currentUser == nil {
		return
	}

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(), "code": "VALIDATION_ERROR"})
		return
	}

	updates := map[string]interface{}{}
	if req.FullName != "" {
		updates["full_name"] = req.FullName
	}
	if req.AvatarURL != "" {
		updates["avatar_url"] = req.AvatarURL
	}

	h.db.Model(currentUser).Updates(updates)
	h.db.First(currentUser)
	c.JSON(http.StatusOK, currentUser)
}

func (h *Handler) ChangePassword(c *gin.Context) {
	currentUser := getCurrentUser(c)
	if currentUser == nil {
		return
	}

	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(), "code": "VALIDATION_ERROR"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(currentUser.PasswordHash), []byte(req.OldPassword)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "incorrect current password", "code": "INVALID_PASSWORD"})
		return
	}

	hash, _ := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	h.db.Model(currentUser).Update("password_hash", string(hash))
	c.JSON(http.StatusOK, gin.H{"message": "password changed successfully"})
}

func getCurrentUser(c *gin.Context) *database.User {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized", "code": "UNAUTHORIZED"})
		return nil
	}
	return user.(*database.User)
}
