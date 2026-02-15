# FileStreamm — Real-Time File Analytics & Notification System

A distributed file storage service with resumable chunked uploads, Kafka-powered event pipeline, real-time dashboard via WebSockets, and multi-channel notifications.

## Highlights (resume bullets)
- Built distributed file storage APIs with **resumable chunked uploads** and **parallel direct-to-MinIO** uploads.
- Implemented **event-driven architecture** using **Apache Kafka** to power analytics counters and notifications.
- Delivered **sub-second live dashboard** using **Socket.IO WebSockets** streaming file events + counters in real time.
- Added **role-based access**: users see their own analytics/events; admins see global analytics.

## Architecture
**Flow:**
Client → Backend (auth + upload session) → MinIO (direct chunk upload)  
Backend emits Kafka events → Analytics service + Notification service + Realtime Gateway  
Realtime Gateway → WebSocket → Dashboard

Services:
- backend (uploads/files/auth) — port 5001
- analytics-service — port 7001
- notification-service — port 7002
- realtime-gateway — port 7003
- dashboard (React/Vite) — port 5173
- infra: MongoDB, MinIO, Kafka

## Quickstart (Docker)
Prereqs: Docker + Docker Compose

```bash
git clone <your-repo>
cd filestreamm
docker compose up --build
