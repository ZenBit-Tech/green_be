## Describe your changes

- Added magic link authentication flow (one-time login via email).
- Implemented EmailService using nodemailer:
  - Uses SMTP configuration from `.env` with fallback to Ethereal in dev.
  - Secure: no token logged, preview URL available only in development.
- Added request endpoint to generate and send magic link.
- Added verification endpoint to validate token and sign in.
- Updated DTOs and Swagger documentation for new endpoints.

## Issue ticket code (and/or) and link

- [Link to JIRA ticket](https://lizbethwangari2018.atlassian.net/browse/ALRAP-101?atlOrigin=eyJpIjoiZmE3ODU2OTRiZmIxNGEzOWFhNGUyYjcxZjNjNzVjODAiLCJwIjoiaiJ9)

### **General**

- [x] Assigned myself to the PR
- [x] Assigned the appropriate labels to the PR
- [x] Assigned the appropriate reviewers to the PR
- [x] Updated the documentation
- [x] Performed a self-review of my code
- [x] Types for input and output parameters
- [x] Don't have "any" on my code
- [x] Used the try/catch pattern for error handling
- [x] Don't have magic numbers
- [x] Compare only with constants not with strings
- [x] No ternary operator inside the ternary operator
- [x] Don't have commented code
- [x] no links in the code, env links should be in env file (for example: server url), constant links (for example default avatar URL) should be in constant file.
- [x] Used camelCase for variables and functions
- [x] Date and time formats are on the constants
- [x] Functions are public only if it's used outside the class
- [x] No hardcoded values
- [ ] covered by tests
- [x] Check your commit messages meet the [conventional commit format](https://www.conventionalcommits.org/en/v1.0.0/).

### Backend

- [x] Swagger documentation updated
- [x] Database requests are optimized and not redundant
- [ ] Unit tests written (to be added next step)
- [x] use ConfigService instead of process.env
- [ ] use transactions if there is a call chain that mutates data in different tables (not applicable yet, single table)
- [ ] use @index decorator for frequently requested data (to add with real DB schema)
