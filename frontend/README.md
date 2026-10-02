# CanteenHub Browser Demo

This frontend is configured for GitHub Pages and runs without a backend or MongoDB server. Accounts, menu edits, and orders are stored in the visitor's browser using local storage. Data is not shared between visitors and is not secure for real accounts or business use. Checkout only creates a demo order; it does not process payments.

## Run Locally

Install Node.js, then run these commands from this directory in PowerShell:

```powershell
npm.cmd install
npm.cmd run dev
```

Open the local URL printed by Vite.

## Demo Login

The owner login is:

- Username: `admin`
- Password: `2067`

Students can register from the registration page. Their account is saved only in the current browser.

## Publish on GitHub Pages

From this directory, run:

```powershell
npm.cmd run deploy
```

The command builds the frontend and publishes the `dist` folder to the `gh-pages` branch. In the GitHub repository, open **Settings > Pages** and select **Deploy from a branch**, then choose `gh-pages` and `/ (root)`.

The Vite build uses the repository path `/CANTEEN-FOOD-ORDERING-SYSTEM/` for GitHub Pages assets. Do not add real passwords or payment details to this demo.
