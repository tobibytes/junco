---
"@junco/blocks": patch
---

Pages take the last few hard-coded links as props, so they work with any router: `DashboardPage customersHref` (null hides "View all"), `OnboardingPage doneHref`, and `LogInPage signUpHref={null}` to hide "Sign up" in invite-only apps.
