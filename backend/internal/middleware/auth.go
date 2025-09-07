package middleware

import (
	"context"
	"net/http"

	"video-player-backend/internal/errors"
	jwtutils "video-player-backend/internal/utils"
)

// AuthMiddleware creates JWT authentication middleware
func AuthMiddleware(jwtManager *jwtutils.JWTManager) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get Authorization header
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				errors.WriteErrorResponse(w, errors.ErrUnauthorized)
				return
			}

			// Extract token from header
			token, err := jwtutils.ExtractTokenFromHeader(authHeader)
			if err != nil {
				errors.WriteErrorResponse(w, errors.ErrUnauthorized)
				return
			}

			// Validate token
			claims, err := jwtManager.ValidateToken(token)
			if err != nil {
				errors.WriteErrorResponse(w, errors.ErrInvalidToken)
				return
			}

			// Add user information to context
			ctx := context.WithValue(r.Context(), "user_id", claims.UserID)
			ctx = context.WithValue(ctx, "user_email", claims.Email)
			ctx = context.WithValue(ctx, "user_username", claims.Username)

			// Call next handler with updated context
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
