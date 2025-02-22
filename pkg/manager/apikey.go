package manager

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/stashapp/stash/pkg/manager/config"
)

var ErrInvalidToken = errors.New("invalid apikey")

const APIKeySubject = "APIKey"

type APIKeyClaims struct {
	UserID string `json:"uid"`
	jwt.StandardClaims
}

func GenerateAPIKey(userID string) (string, error) {
	claims := &APIKeyClaims{
		UserID: userID,
		StandardClaims: jwt.StandardClaims{
			Subject:  APIKeySubject,
			IssuedAt: time.Now().Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	ss, err := token.SignedString(config.GetInstance().GetJWTSignKey())
	if err != nil {
		return "", err
	}

	return ss, nil
}

// GetUserIDFromAPIKey validates the provided api key and returns the user ID
func GetUserIDFromAPIKey(apiKey string) (string, error) {
	claims := &APIKeyClaims{}
	token, err := jwt.ParseWithClaims(apiKey, claims, func(t *jwt.Token) (interface{}, error) {
		return config.GetInstance().GetJWTSignKey(), nil
	})

	if err != nil {
		return "", err
	}

	if !token.Valid {
		return "", ErrInvalidToken
	}

	return claims.UserID, nil
}
