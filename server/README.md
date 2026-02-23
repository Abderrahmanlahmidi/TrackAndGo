# DB Server (json-server)

REST API b Docker.

## Requirements
- Docker
- Docker Compose

## Run Server
```bash
docker compose up -d --build
```

## URLs
- Home: `http://localhost:3000`
- Colis: `http://localhost:3000/colis`
- Drivers: `http://localhost:3000/drivers`

## Stop Server
```bash
docker compose down
```

## Show Logs
```bash
docker compose logs -f json-server
```

## Regenerate DB (Optional)
```bash
node data-generate.js
docker compose up -d --build 
```
