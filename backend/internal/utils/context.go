package utils

import (
	"context"
	"time"
)

// ContextWithTimeout creates a context with timeout
func ContextWithTimeout() (context.Context, context.CancelFunc) {
	return context.WithTimeout(context.Background(), 10*time.Second)
}
