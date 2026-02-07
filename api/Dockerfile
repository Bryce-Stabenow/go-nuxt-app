FROM golang:1.25.5-alpine AS builder

ENV CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -trimpath -ldflags="-s -w" -o /bin/api .

FROM alpine:3.21

WORKDIR /app
COPY --from=builder /bin/api /app/api

ENV PORT=8080
EXPOSE 8080

CMD ["/app/api"]
