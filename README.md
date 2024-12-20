# Task Board

A brief description of your project. Add details about what the project does, its purpose, and any key features.

## Table of Contents

- [Task Board](#task-board)
  - [Table of Contents](#table-of-contents)
  - [Development](#development)
    - [Prerequisites](#prerequisites)
    - [Steps](#steps)
  - [Docker](#docker)
    - [Prerequisites](#prerequisites-1)
    - [Steps](#steps-1)

---

## Development

### Prerequisites

To run the application in development mode locally, ensure the `DATABASE_URL` is configured in the `.env` file. You can follow the structure of `.env.example`.

### Steps

1. Install all the required packages:

   ```bash
   npm install
   ```

2. If the database is not initialized yet, run:

   ```bash
   npx prisma migrate deploy
   ```

3. To seed the database, execute:

   ```bash
   npx prisma db seed
   ```

4. Start the development server and navigate to [http://localhost:3000](http://localhost:3000).

---

## Docker

### Prerequisites

Ensure Docker is installed on your system.

### Steps

1. Build and start the application using Docker Compose:

   ```bash
   docker-compose up --build
   ```

2. Seed the database by running the following in a separate terminal:

   ```bash
   docker-compose exec web npx prisma db seed
   ```

---
