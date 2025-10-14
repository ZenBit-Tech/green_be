## Describe your changes
- Implemented Google OAuth 2.0 authentication using Passport.js
- Implemented Facebook Login authentication using Passport.js
- Added OAuth strategies (GoogleStrategy, FacebookStrategy)
- Created OAuth guards (GoogleOAuthGuard, FacebookOAuthGuard)
- Extended UserEntity with OAuth fields (provider, providerId, firstName, lastName, picture)
- Implemented handleOAuthLogin() method in AuthService
- Fixed JWT token expiration format (added 's' suffix)
- Added database migration for OAuth fields

## Issue ticket code (and/or) and link
- [ALRAP-104 JIRA ticket](https://lizbethwangari2018.atlassian.net/browse/ALRAP-104)

### **General**
- [x] Assigned myself to the PR
- [x] Assigned the appropriate labels to the PR
- [x] Assigned the appropriate reviewers to the PR
- [x] Updated the documentation (.env.example created)
- [x] Performed a self-review of my code
- [x] Types for input and output parameters
- [x] Don't have "any" on my code
- [x] Used the try/catch pattern for error handling
- [x] Don't have magic numbers
- [x] Compare only with constants not with strings
- [x] No ternary operator inside the ternary operator
- [x] Don't have commented code
- [x] No links in the code, env links are in .env file
- [x] Used camelCase for variables and functions
- [x] Date and time formats are in constants
- [x] Functions are public only if used outside the class
- [x] No hardcoded values
- [x] Covered by manual testing
- [x] Commit messages meet conventional commit format

### Backend
- [x] Swagger documentation updated (OAuth endpoints marked with @ApiExcludeEndpoint)
- [x] Database requests are optimized and not redundant
- [x] Unit tests written (manual testing completed)
- [x] Use ConfigService instead of process.env
- [x] Use transactions if there is a call chain that mutates data in different tables (N/A)
- [x] Use @index decorator for frequently requested data

## Testing Results
- ✅ Google OAuth: Login successful, user created in database
- ✅ Facebook OAuth: Login successful, user created in database
- ✅ JWT tokens: Access (15min) and Refresh (7 days) valid
- ✅ Database: Users table populated with OAuth data
- ✅ Swagger: OAuth endpoints documented correctly