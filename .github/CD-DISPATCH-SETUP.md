# CD Dispatch — one-time secret setup

The CD code is already in place. To finish wiring it up, an org admin must create
**one GitHub App** and **one Vercel deploy hook**, then store three secrets. None of
this can be automated by the agent — writing org/repo secrets requires admin
credentials the CI/agent token does not have.

## How the loop works

```
engine repo changes (Vm / Render / Paint / Parser)
  -> workflow mints a short-lived token via actions/create-github-app-token
  -> repository_dispatch(type: update) -> PatternYard-Home + PatternYard-Packager
        -> Home:     redeploy-on-dispatch.yml  -> POST Vercel deploy hook -> redeploy
        -> Packager: deploy.yml (already listening) -> rebuild
```

No long-lived personal access token is used: the dispatch token is generated at
runtime, expires in ~1 hour, and is scoped to exactly the two target repos.

## 1. Create the GitHub App (replaces the PAT)

Fastest path — create from the manifest in this folder
(`.github/dispatch-app-manifest.json`):

1. Go to: `https://github.com/organizations/patternyard/settings/apps/new`
2. Or use the manifest flow to pre-fill permissions (Contents: Read & write,
   Metadata: Read). The manifest already encodes these.
3. After creating the App:
   - Note the **App ID**.
   - Generate a **private key** (.pem download).
   - **Install** the App on the `patternyard` org, granting access to
     **PatternYard-Home** and **PatternYard-Packager** only.

## 2. Create the Vercel deploy hook (for Home)

1. Vercel dashboard -> project **patternyard-home** -> Settings -> Git -> Deploy Hooks.
2. Create a hook on branch **main** (name it e.g. `dispatch`).
3. Copy the generated URL. It is password-equivalent — store it only as a secret.

## 3. Store the secrets

Run these as an org admin (your own `gh` login), or use the dashboard UIs.

```bash
# GitHub App credentials -> org secrets, scoped to the 4 engine repos
gh secret set DISPATCH_APP_ID --org patternyard --visibility selected \
  --repos PatternYard-Vm,PatternYard-Render,PatternYard-Paint,PatternYard-Parser
gh secret set DISPATCH_APP_PRIVATE_KEY --org patternyard --visibility selected \
  --repos PatternYard-Vm,PatternYard-Render,PatternYard-Paint,PatternYard-Parser
# (for the private key, paste the full .pem contents when prompted, or:
#  gh secret set DISPATCH_APP_PRIVATE_KEY --org patternyard --visibility selected \
#    --repos PatternYard-Vm,PatternYard-Render,PatternYard-Paint,PatternYard-Parser < app-private-key.pem )

# Vercel deploy hook URL -> repo secret on Home
gh secret set VERCEL_DEPLOY_HOOK --repo patternyard/PatternYard-Home
```

## 4. Merge the held PRs

Once the secrets exist, merge:

- PatternYard-Vm   #4  (App-token dispatch)
- PatternYard-Render #2
- PatternYard-Paint  #2
- PatternYard-Parser #2
- PatternYard-Home   #8 (this listener)

Then trigger a test run from any engine repo (Actions -> the dispatch workflow ->
Run workflow) and confirm Home redeploys + Packager rebuilds.

## Verifying

- Engine repo Actions run shows the "Generate dispatch token" step succeed and the
  dispatch step return 204.
- Home Actions shows "Redeploy on dispatch" run and the deploy hook POST return 201.
- A new patternyard.dev deployment appears in Vercel.
