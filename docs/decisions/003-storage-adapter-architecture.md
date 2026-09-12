# ADR 003: Unified Storage Adapter & File Metadata Architecture

## Status
Accepted

## Context
Assessment rough work, proctoring snapshots, and candidate project attachments require persistent storage. Storing files directly in the database as blobs causes performance bottlenecks and bloated database backups, whereas storing raw files on disk without metadata tracking leads to orphaned assets and unmonitored disk growth.

## Decision
We implement a **Dual-Layer Storage Architecture**:
1. **Metadata Registry (`files` table in PostgreSQL)**:
   - Tracks `uploader_id`, `original_name`, `file_name`, `mime_type`, `size_bytes`, `storage_path`, `public_url`, and association with `entity_type` / `entity_id`.
2. **Local Storage Adapter with Cloud Pluggability**:
   - For local development and standard deploys, files are stored under `./uploads` with sanitized names (`rw-<timestamp>-<hash>`).
   - Express serves public URLs under `/uploads`.
   - The interface is decoupled so an S3 or Google Cloud Storage (GCS) driver can be swapped in by replacing the adapter class without altering consumer services.

## Consequences
- **Positive**: Complete auditability of storage consumption and user ownership.
- **Positive**: Safe, isolated filenames prevent path traversal vulnerabilities.
- **Positive**: Zero database bloat while maintaining fast asset streaming.
