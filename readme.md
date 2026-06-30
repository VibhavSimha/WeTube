# WeTube

A work-in-progress backend practice project inspired by YouTube, built with Node.js, Express, and MongoDB.

## Tech Stack

- Node.js
- Express
- MongoDB (Mongoose)
- JWT authentication
- Cloudinary (media storage)

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- Cloudinary account

### Setup

```bash
npm install
cp src/.env.sample .env
# Fill in your values in .env
```

### Run

```bash
npm run dev   # development (nodemon)
npm start     # production
```

Server runs on port **8001** by default (`PORT` in `.env`).

## Documentation

This project is still being built out. For a snapshot of routes implemented so far, see [docs/api.md](docs/api.md).

Environment variables are documented in [src/.env.sample](.env.sample).

## License

ISC
