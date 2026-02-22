# Protel Server (Backend API)

This repository contains the Node.js Express Backend for the Protel Automated APD (Personal Protective Equipment) and Liveness Verification System.

It acts as an orchestrator and data-storage server, linking the frontend React application with the Python-based AI microservice (`protel.radityarakha.my.id`).

## Architecture & Technology Stack

- **Framework**: Express.js (Node.js) with TypeScript
- **Database ORM**: Prisma (PostgreSQL / MySQL)
- **Cameras**: RTSP Stream Integration using `node-rtsp-stream`

## Features

- **Face Recognition Gateway**: Forwards face photos to the AI server and logs the results.
- **PPE Verification Processing**: Handles the verification payload containing Helmet, Vest, Gloves, and Boots statuses (Mask & Glasses are explicitly omitted from compliance evaluation).
- **Liveness Challenge Linkage**: Routes frontend liveness validation streams (`/verify_liveness`) to the dedicated AI processing node.
- **RTSP Camera Streaming**: Proxies local camera RTSP streams into low-latency WebSockets.
- **Worker & Role Management**: Provides CRUD APIs for workers (`pekerja`) and titles (`jabatan`).

## Prerequisites

- Node.js LTS (v18+)
- Prisma CLI (`npm install -g prisma`)
- Database Server credentials configured in `.env`

## Running Locally

1. Install Dependencies:
   ```bash
   npm install
   ```
2. Setup Prisma Database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
3. Start the Server:
   ```bash
   npm run dev
   ```
   The server typically runs on `http://localhost:5005`.

## Key Endpoints

- `POST /api/verify`: Main pipeline for Face and PPE processing.
- `POST /api/verify_liveness`: Pipeline explicitly tracking blink timing.
- `POST /api/absensi`: Submit finalized APD compliance result to the database.
- `GET /api/absensi/today`: Fetch the logs for the day's attendance.
