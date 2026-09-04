# Data Directory

This directory stores project data, processed files, and uploads.

## Structure

- `demo/` - Demo/sample data for testing
- `processed/` - Processed output files

## Usage

The `data/` directory is mounted as a Docker volume in `docker-compose.yml`:
```yaml
volumes:
  - ./data:/app/data
```

This ensures data persists between container restarts.

## Notes

- Do not commit large files to this directory
- Add `.gitkeep` files to preserve empty directory structure
- Processed files are generated at runtime by the backend
