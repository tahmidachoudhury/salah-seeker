# Salah Seeker Architecture

> Created: 03.10.25

> Updated: 03.10.25

## Current MVP (Oct 2025)

- **Frontend**: React Native (Expo Router)
  - Mapbox map view
  - Firestore integration
  - Prayer Times API (Aladhan)
  - Offline cache with AsyncStorage
- **Backend**: Firebase
  - Firestore (users, listings, spots)
  - Firebase Storage (images)
  - Authentication (if needed later)
- **Infra**: Expo EAS builds (Android + iOS)
- **Monitoring**: Basic logs, no observability yet

## Planned (Refactor → AWS)

- **Frontend**: same RN app, but API calls abstracted
- **Backend**:
  - DynamoDB for users + listings
  - S3 for images
  - AppSync or API Gateway + Lambda
- **Infra**:
  - CI/CD with GitHub Actions → EAS
  - Monitoring with CloudWatch
- **Extras**:
  - Notifications (SNS or Firebase Cloud Messaging)
  - Rate limiting + API keys
