Adds up the stars on an account's public repositories every 15 minutes and lists the ones with the most. Forks don't count.

## Settings

- **User or organization:** whose repositories to count.
- **Repositories to list:** how many the list shows. The large size shows up to four.

## Permissions

- **Can reach api.github.com,** and only that host. The app refuses any other address the collector asks for.
- **Needs your GITHUB_TOKEN,** if you have one. Without it GitHub allows 60 requests an hour, which is enough for one account; with it, 5,000. A token with no scopes is all it needs, since it reads public data only. The token is kept encrypted on your PC and only goes to api.github.com.
