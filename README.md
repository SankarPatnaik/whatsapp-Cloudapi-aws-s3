# WhatsApp Cloud API to Amazon S3 Uploader

This project provides a production-ready Express application that listens to WhatsApp Cloud API webhooks and automatically saves any **images**, **videos**, **documents**, or **audio** files sent to your business number into an Amazon S3 bucket. Each sender gets an isolated folder structure to keep uploads organized and easy to audit.

## Features

- ✅ Webhook verification endpoint compatible with Meta's WhatsApp Cloud API.
- ✅ Automatic handling of image, video, document, and audio message types.
- ✅ Media downloads via the Graph API using your app access token.
- ✅ Structured Amazon S3 uploads (`<wa_id>/<media_type>/<filename>`).
- ✅ Centralized configuration with helpful logging to detect misconfiguration early.
- ✅ Health endpoint (`/health`) to simplify uptime monitoring.

## Prerequisites

- Node.js 16+
- An active WhatsApp Cloud API application with webhook access
- An Amazon S3 bucket and IAM credentials with `s3:PutObject` permission

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file based on the template below and supply your secrets:

   ```dotenv
   # Server
   PORT=8080
   GRAPH_API_VERSION=v18.0
   VERIFY_TOKEN=your_webhook_verify_token

   # WhatsApp Cloud API
   TOKEN=your_long_lived_access_token

   # Amazon S3
   AWS_S3_BUCKET=your-s3-bucket-name
   AWS_S3_REGION=us-east-1
   AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
   AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
   # Optional: store everything under a base prefix such as "production/"
   # AWS_S3_BASE_PREFIX=production
   ```

   > The application still supports the previous variable names (`MYTOKEN`, `S3_AccKEY`, `S3_SecAccKEY`) so existing deployments continue to work.

3. Start the server:

   ```bash
   npm run start
   ```

4. Configure your WhatsApp Cloud API webhook URL in Meta Developer Console to `https://<your-domain>/webhook` and supply the same `VERIFY_TOKEN` value defined in your `.env` file.

## Folder Structure

Media is stored in S3 using the following pattern:

```
<sending_wa_id>/images/<filename>
<sending_wa_id>/videos/<filename>
<sending_wa_id>/documents/<filename>
<sending_wa_id>/audio/<filename>
```

Filenames are sanitized to avoid invalid characters and the correct file extension is inferred from the media MIME type whenever possible.

## Health Check

A lightweight endpoint is available for uptime monitoring:

```
GET /health -> { "status": "ok" }
```

## Development Notes

- Enable verbose logging by setting `DEBUG=true` before starting the server.
- Errors encountered while processing individual messages are logged but do not interrupt processing of other messages in the same webhook batch.

## License

This project is licensed under the ISC License. See [LICENSE](LICENSE) for more information.
