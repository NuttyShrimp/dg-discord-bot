FROM golang:1.19 AS builder

WORKDIR /app

COPY go.mod .
COPY go.sum .

RUN go mod download

COPY . ./

RUN CGO_ENABLED=0 GOOS=linux go build -o dg-disco cmds/bot/main.go

FROM alpine:latest

COPY --from=builder /app/dg-disco .
COPY .env ./.env

CMD ./dg-disco
