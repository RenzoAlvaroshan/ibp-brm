package middleware

import (
	"net/http"
	"strings"

	"github.com/brm-app/backend/internal/auth"
	"github.com/brm-app/backend/pkg/config"
	"github.com/brm-app/backend/pkg/database"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func AuthRequired(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "authorization header required", "code": "UNAUTHORIZED"})
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization format", "code": "UNAUTHORIZED"})
			return
		}

		claims, err := auth.ValidateToken(parts[1], cfg.JWTSecret)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token", "code": "TOKEN_EXPIRED"})
			return
		}

		userID, err := uuid.Parse(claims.UserID)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token", "code": "UNAUTHORIZED"})
			return
		}

		var user database.User
		if err := database.DB.First(&user, "id = ?", userID).Error; err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "user not found", "code": "UNAUTHORIZED"})
			return
		}

		c.Set("user", &user)
		c.Set("userID", userID)
		c.Set("role", string(user.Role))
		c.Next()
	}
}

func RequireRole(roles ...database.Role) gin.HandlerFunc {
	return func(c *gin.Context) {
		user, exists := c.Get("user")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized", "code": "UNAUTHORIZED"})
			return
		}

		u := user.(*database.User)
		for _, role := range roles {
			if u.Role == role {
				c.Next()
				return
			}
		}

		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "insufficient permissions", "code": "FORBIDDEN"})
	}
}

func GetCurrentUser(c *gin.Context) *database.User {
	user, _ := c.Get("user")
	if user == nil {
		return nil
	}
	return user.(*database.User)
}
