package middleware

import (
	"context"
	"net/http"
	"strings"

	"video-player-backend/internal/errors"
	"video-player-backend/internal/utils"
)

// AdminMiddleware checks if the user has admin role
func AdminMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get the authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			errors.WriteErrorResponse(w, errors.ErrUnauthorized)
			return
		}

		// Check if the header starts with "Bearer "
		if !strings.HasPrefix(authHeader, "Bearer ") {
			errors.WriteErrorResponse(w, errors.ErrUnauthorized)
			return
		}

		// Extract the token
		token := strings.TrimPrefix(authHeader, "Bearer ")

		// Parse and validate the token
		claims, err := utils.ParseJWTToken(token)
		if err != nil {
			errors.WriteErrorResponse(w, errors.ErrInvalidToken)
			return
		}

		// Check if user has admin role
		userRole, ok := claims["role"].(string)
		if !ok || userRole != "admin" {
			errors.WriteErrorResponse(w, errors.NewAPIError("INSUFFICIENT_PERMISSIONS", "Admin role required"))
			return
		}

		// Add user info to context for use in handlers
		ctx := context.WithValue(r.Context(), "user_id", claims["user_id"])
		ctx = context.WithValue(ctx, "user_role", claims["role"])
		ctx = context.WithValue(ctx, "user_email", claims["email"])

		// Call the next handler
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
