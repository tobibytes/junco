---
"@junco/blocks": patch
---

UsersPage and TeamMembersPage now call the latest `onUsersChange` / `onMembersChange`. Before, changing a role or removing someone called the callback from the first render.
