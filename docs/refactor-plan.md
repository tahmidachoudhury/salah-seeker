# Salah Seeker Refactor Plan

> Created: 03.10.25

> Updated: 03.10.25

The idea is to stage the migration from Firebase services to AWS. Auth, Storage, DB will all be migrating to AWS if more users use the app.

## Stage 1: After MVP feedback

- Abstract database layer (replace direct Firestore calls with a `db/` interface)
- Add unit tests for db + caching
- Improve error handling (API + Firestore failures)

## Stage 2: Before Store Launch

- Polish UI/UX based on tester feedback
- Add moderation/verification flow
- Harden security rules (Firestore → or IAM roles)

## Stage 3: Portfolio / AWS Migration

- Migrate Firestore → DynamoDB
- Migrate Firebase Storage → AWS S3
- Set up AppSync / Lambda
- Add CloudWatch metrics + logging
- Write case study with diagrams
