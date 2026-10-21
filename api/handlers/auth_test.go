package handlers

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"bryce-stabenow/grocer-me/config"

	"github.com/golang-jwt/jwt/v5"
)

func TestAuthSessionLasts28Days(t *testing.T) {
	previousSecret := config.JWTSecret
	config.JWTSecret = "session-test-secret"
	t.Cleanup(func() { config.JWTSecret = previousSecret })

	before := time.Now().Truncate(time.Second)
	tokenString, err := generateToken("test-user")
	if err != nil {
		t.Fatal(err)
	}
	keyFunc := func(token *jwt.Token) (interface{}, error) {
		return []byte(config.JWTSecret), nil
	}
	token, err := jwt.Parse(tokenString, keyFunc, jwt.WithValidMethods([]string{"HS256"}))
	if err != nil {
		t.Fatal(err)
	}
	claims := token.Claims.(jwt.MapClaims)
	issuedAt, err := claims.GetIssuedAt()
	if err != nil || issuedAt == nil {
		t.Fatalf("missing issue time: %v", err)
	}
	expiresAt, err := claims.GetExpirationTime()
	if err != nil || expiresAt == nil {
		t.Fatalf("missing expiration time: %v", err)
	}
	const lifetime = 28 * 24 * time.Hour
	if expiresAt.Sub(issuedAt.Time) != lifetime {
		t.Fatalf("token lifetime = %v, want %v", expiresAt.Sub(issuedAt.Time), lifetime)
	}
	if claims["user_id"] != "test-user" {
		t.Fatalf("unexpected user ID: %v", claims["user_id"])
	}

	// A returning user can still authenticate after weeks away, but not after expiry.
	for _, days := range []int{1, 14, 27, 28} {
		_, err := jwt.Parse(tokenString, keyFunc, jwt.WithTimeFunc(func() time.Time {
			return issuedAt.Add(time.Duration(days) * 24 * time.Hour)
		}))
		if days < 28 && err != nil {
			t.Errorf("token rejected after %d days: %v", days, err)
		}
		if days == 28 && err == nil {
			t.Error("token accepted at its 28-day expiration")
		}
	}

	recorder := httptest.NewRecorder()
	setAuthCookie(recorder, tokenString)
	cookies := recorder.Result().Cookies()
	if len(cookies) != 1 {
		t.Fatalf("got %d cookies, want 1", len(cookies))
	}
	cookie := cookies[0]
	if cookie.Name != "jwt_token" || cookie.Value != tokenString || cookie.Path != "/" || !cookie.HttpOnly {
		t.Fatalf("unexpected authentication cookie: %+v", cookie)
	}
	if cookie.MaxAge != 28*24*60*60 {
		t.Errorf("cookie Max-Age = %d, want 2419200", cookie.MaxAge)
	}
	if cookie.Expires.Before(before.Add(lifetime)) || cookie.Expires.After(time.Now().Add(lifetime)) {
		t.Errorf("cookie expiration = %v, want 28 days from now", cookie.Expires)
	}
}

func TestLogoutExpiresPersistentCookie(t *testing.T) {
	recorder := httptest.NewRecorder()
	HandleLogout(recorder, httptest.NewRequest(http.MethodPost, "/logout", nil))
	if recorder.Code != http.StatusOK {
		t.Fatalf("logout status = %d, want 200", recorder.Code)
	}
	cookies := recorder.Result().Cookies()
	if len(cookies) != 1 {
		t.Fatalf("got %d cookies, want 1", len(cookies))
	}
	cookie := cookies[0]
	if cookie.Name != "jwt_token" || cookie.Value != "" || cookie.MaxAge != -1 || cookie.Path != "/" || !cookie.HttpOnly {
		t.Fatalf("unexpected logout cookie: %+v", cookie)
	}
	if cookie.Expires.IsZero() || !cookie.Expires.Before(time.Now()) {
		t.Errorf("logout cookie is not expired: %v", cookie.Expires)
	}
}
