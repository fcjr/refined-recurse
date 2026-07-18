# Releasing

Releases are automated. Pushing a `v*` tag triggers the
[`Release` workflow](../.github/workflows/release.yml), which builds the
extension, sets its version from the tag, and submits it to both the Chrome Web
Store and Firefox Add-ons (AMO), auto-published after each store's review
passes.

```bash
git tag v0.2.0 && git push origin v0.2.0
```

The tag (minus the leading `v`) becomes the extension version. It must be
higher than the currently published version, or Chrome rejects the upload.

## One-time setup: GitHub secrets

The workflow needs seven secrets — four for Chrome, three for Firefox. Add them
under **repo Settings → Secrets and variables → Actions → New repository
secret**:

| Secret name | Source |
| --- | --- |
| `CHROME_EXTENSION_ID` | Chrome Web Store dashboard (step 1) |
| `CHROME_CLIENT_ID` | Google Cloud OAuth client (step 2c) |
| `CHROME_CLIENT_SECRET` | Google Cloud OAuth client (step 2c) |
| `CHROME_REFRESH_TOKEN` | OAuth authorization flow (step 2d) |
| `FIREFOX_EXTENSION_ID` | AMO — add-on ID / slug (step 3) |
| `FIREFOX_JWT_ISSUER` | AMO API credentials (step 3) |
| `FIREFOX_JWT_SECRET` | AMO API credentials (step 3) |

### 1. `CHROME_EXTENSION_ID`

1. Open the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Click the extension.
3. Copy the 32-character **Item ID** (also visible in the page URL), e.g.
   `abcdefghijklmnopabcdefghijklmnop`.

### 2. The three OAuth secrets

Requires a Google Cloud project with the Chrome Web Store API enabled. Do this
once.

#### a. Enable the API

1. Go to [console.cloud.google.com](https://console.cloud.google.com), create a
   project (e.g. `cws-publish`).
2. **APIs & Services → Library**, search **"Chrome Web Store API"**, click it,
   **Enable**.

#### b. Configure the OAuth consent screen

1. **APIs & Services → OAuth consent screen**.
2. User type: **External** → Create.
3. Fill in app name and your email; skip optional fields.
4. **Scopes** — skip.
5. **Test users** → add the Google account that owns the extension.
   ⚠️ Without this, the token request fails.
6. Save. Leave it in **Testing** status; you don't need to publish the consent
   screen.

#### c. Create the OAuth client → `CHROME_CLIENT_ID` + `CHROME_CLIENT_SECRET`

1. **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
2. Application type: **Desktop app**.
3. Name it, **Create**.
4. The dialog shows the **Client ID** and **Client secret**.

#### d. Get `CHROME_REFRESH_TOKEN`

Easiest path — let WXT's wizard do the OAuth dance:

```bash
npm run submit:init
```

It prompts for the extension ID, client ID, and client secret from the steps
above, opens a browser to authorize with your Google account, and captures the
refresh token automatically. It writes all four values into a local
`.env.submit` file (gitignored). Copy them into the GitHub secrets.

<details>
<summary>Manual refresh-token flow (alternative to the wizard)</summary>

1. Open this URL in a browser (replace `YOUR_CLIENT_ID`):

   ```
   https://accounts.google.com/o/oauth2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&access_type=offline&approval_prompt=force&redirect_uri=urn:ietf:wg:oauth:2.0:oob&client_id=YOUR_CLIENT_ID
   ```

   If the `oob` redirect is rejected, add `http://localhost` as an authorized
   redirect URI on the OAuth client and use that instead.
2. Authorize with the extension-owner account → you get an authorization
   **code**.
3. Exchange it for a refresh token:

   ```bash
   curl "https://accounts.google.com/o/oauth2/token" -d \
   "client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&code=THE_CODE&grant_type=authorization_code&redirect_uri=urn:ietf:wg:oauth:2.0:oob"
   ```
4. The response's `refresh_token` field is `CHROME_REFRESH_TOKEN`.

</details>

### 3. The three Firefox secrets

Firefox Add-ons (AMO) uses API keys instead of OAuth.

1. Sign in at [addons.mozilla.org](https://addons.mozilla.org) with the account
   that owns the add-on.
2. Go to **[API Credentials](https://addons.mozilla.org/developers/addon/api/key/)**
   (Developer Hub → Tools → Manage API Keys).
3. Generate credentials — you get a **JWT issuer** (looks like `user:12345:67`)
   and a **JWT secret** (a long hex string, shown **only once** — copy it now).
   These are `FIREFOX_JWT_ISSUER` and `FIREFOX_JWT_SECRET`.
4. `FIREFOX_EXTENSION_ID` is the add-on's ID — the `id` in the
   `browser_specific_settings.gecko` block of the built manifest, or the add-on
   slug from its AMO listing URL. For a not-yet-listed add-on, this is the ID
   you'll assign on first submission.

> AMO requires a **source-code zip** for review because the extension is
> bundled. The release workflow builds and uploads it automatically
> (`.output/*-sources.zip`) — no action needed.

The `npm run submit:init` wizard can collect these Firefox values too; select
Firefox when prompted and it writes them into `.env.submit` alongside the
Chrome ones.

## Gotchas

- The refresh token is tied to its client ID/secret and the authorizing
  account. Regenerate the token if you rotate the OAuth client.
- Because the consent screen stays in **Testing** mode, Google can expire the
  refresh token after 7 days on some configurations. If publishing fails later
  with an auth error, re-run `npm run submit:init` to mint a fresh token.
- Each tag's version must exceed the currently published version.
