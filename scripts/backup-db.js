const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Return an ISO-ish timestamp safe for filenames (colons replaced with dashes).
 * Example: "2026-07-15T00-00-00"
 */
function fileTimestamp(date = new Date()) {
  return date.toISOString().replace(/:/g, '-').replace(/\.\d{3}Z$/, '');
}

/**
 * Ensure a directory exists (recursive).
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`[backup] Created directory: ${dirPath}`);
  }
}

/**
 * Delete files in `dir` whose mtime is older than `maxAgeDays`.
 */
function rotateLocalBackups(dir, maxAgeDays = 7) {
  if (!fs.existsSync(dir)) return;

  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const stat = fs.statSync(filePath);
      if (stat.isFile() && stat.mtimeMs < cutoff) {
        fs.unlinkSync(filePath);
        console.log(`[backup] Rotated (deleted) old local backup: ${file}`);
      }
    } catch (err) {
      console.error(`[backup] Error checking/deleting file ${file}:`, err.message);
    }
  }
}

// ---------------------------------------------------------------------------
// S3 helpers (lazy-loaded so the script still works without the SDK installed)
// ---------------------------------------------------------------------------

/**
 * Upload a file to S3.
 */
async function uploadToS3(filePath, s3Key, bucket, region) {
  const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

  const client = new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const fileStream = fs.createReadStream(filePath);

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: s3Key,
    Body: fileStream,
    ContentType: 'application/sql',
  });

  await client.send(command);
  console.log(`[backup] Uploaded to S3: s3://${bucket}/${s3Key}`);
}

/**
 * Delete S3 objects under `prefix` that are older than `maxAgeDays`.
 */
async function rotateS3Backups(bucket, region, prefix = 'db-backups/', maxAgeDays = 30) {
  const {
    S3Client,
    ListObjectsV2Command,
    DeleteObjectsCommand,
  } = require('@aws-sdk/client-s3');

  const client = new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const cutoff = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);

  let continuationToken;
  const keysToDelete = [];

  // Paginate through all objects under the prefix
  do {
    const listCommand = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    });

    const response = await client.send(listCommand);
    const contents = response.Contents || [];

    for (const obj of contents) {
      if (obj.LastModified && obj.LastModified < cutoff) {
        keysToDelete.push({ Key: obj.Key });
      }
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  if (keysToDelete.length === 0) {
    console.log('[backup] No old S3 backups to rotate.');
    return;
  }

  // DeleteObjects accepts up to 1000 keys per request
  const chunkSize = 1000;
  for (let i = 0; i < keysToDelete.length; i += chunkSize) {
    const chunk = keysToDelete.slice(i, i + chunkSize);
    const deleteCommand = new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: { Objects: chunk, Quiet: true },
    });
    await client.send(deleteCommand);
    console.log(`[backup] Rotated ${chunk.length} old S3 backup(s).`);
  }
}

// ---------------------------------------------------------------------------
// Main backup function
// ---------------------------------------------------------------------------

async function runBackup() {
  console.log('[backup] Starting database backup…');

  // ---- 1. Read MySQL credentials from env vars ----
  const mysqlHost = process.env.MYSQLHOST;
  const mysqlUser = process.env.MYSQLUSER;
  const mysqlPassword = process.env.MYSQLPASSWORD;
  const mysqlDatabase = process.env.MYSQLDATABASE;
  const mysqlPort = process.env.MYSQLPORT || '3306';

  if (!mysqlHost || !mysqlUser || !mysqlPassword || !mysqlDatabase) {
    throw new Error(
      '[backup] Missing required MySQL env vars. Need: MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE'
    );
  }

  // ---- 2. Prepare paths ----
  const backupsDir = path.resolve(__dirname, '..', 'backups');
  ensureDir(backupsDir);

  const timestamp = fileTimestamp();
  const sqlFilename = `backup-${timestamp}.sql`;
  const gzFilename = `${sqlFilename}.gz`;
  const sqlFilePath = path.join(backupsDir, sqlFilename);

  // ---- 3. Run mysqldump ----
  const dumpCmd = [
    'mysqldump',
    `--host=${mysqlHost}`,
    `--port=${mysqlPort}`,
    `--user=${mysqlUser}`,
    `--password=${mysqlPassword}`,
    '--single-transaction',
    '--routines',
    '--triggers',
    `--result-file=${sqlFilePath}`,
    mysqlDatabase,
  ].join(' ');

  console.log(`[backup] Running mysqldump for database "${mysqlDatabase}"…`);

  try {
    execSync(dumpCmd, { stdio: 'pipe' });
  } catch (dumpErr) {
    const stderr = dumpErr.stderr ? dumpErr.stderr.toString() : dumpErr.message;
    throw new Error(`[backup] mysqldump failed: ${stderr}`);
  }

  console.log(`[backup] Dump saved: ${sqlFilePath}`);

  // ---- 4. Attempt gzip compression ----
  let finalFilePath = sqlFilePath;
  let finalFilename = sqlFilename;

  try {
    execSync(`gzip -f "${sqlFilePath}"`, { stdio: 'pipe' });
    finalFilePath = path.join(backupsDir, gzFilename);
    finalFilename = gzFilename;
    console.log(`[backup] Compressed: ${finalFilePath}`);
  } catch {
    console.warn('[backup] gzip not available – keeping uncompressed .sql file.');
  }

  // ---- 5. Upload to S3 (if configured) ----
  const s3Bucket = process.env.AWS_S3_BUCKET;
  const s3Region = process.env.AWS_REGION || 'us-east-1';
  const s3AccessKey = process.env.AWS_ACCESS_KEY_ID;
  const s3SecretKey = process.env.AWS_SECRET_ACCESS_KEY;

  const s3Configured = s3Bucket && s3AccessKey && s3SecretKey;

  if (!s3Configured) {
    console.warn(
      '[backup] S3 env vars not fully set (AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY). Skipping S3 upload – local-only mode.'
    );
  } else {
    const s3Key = `db-backups/backup-${timestamp}.sql`;

    try {
      await uploadToS3(finalFilePath, s3Key, s3Bucket, s3Region);
    } catch (s3Err) {
      console.error('[backup] S3 upload failed:', s3Err.message);
      // Don't throw – the local backup is still valid
    }

    // ---- 6. Rotate old S3 backups (older than 30 days) ----
    try {
      await rotateS3Backups(s3Bucket, s3Region, 'db-backups/', 30);
    } catch (rotateErr) {
      console.error('[backup] S3 rotation failed:', rotateErr.message);
    }
  }

  // ---- 7. Rotate old local backups (older than 7 days) ----
  try {
    rotateLocalBackups(backupsDir, 7);
  } catch (localRotateErr) {
    console.error('[backup] Local rotation failed:', localRotateErr.message);
  }

  console.log('[backup] Backup completed successfully.');
  return { file: finalFilePath, timestamp };
}

// ---------------------------------------------------------------------------
// Run standalone: node scripts/backup-db.js
// ---------------------------------------------------------------------------
if (require.main === module) {
  runBackup()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

module.exports = { runBackup };
