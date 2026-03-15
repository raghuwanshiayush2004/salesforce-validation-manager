# 🌩️ Salesforce Validation Rule Manager
### CloudVandana – Associate Software Engineer Assignment #1

A full-stack React + Node.js web app to manage Salesforce Account validation rules
via OAuth 2.0 + Tooling API.

---

## 📁 Project Structure

```
salesforce-validation-manager/
├── backend/                  ← Node.js + Express API
│   ├── server.js
│   ├── .env.example          ← Copy this to .env and fill values
│   ├── package.json
│   └── routes/
│       ├── auth.js           ← OAuth 2.0 login/callback/logout
│       └── salesforce.js     ← Validation rule CRUD via Tooling API
│
└── frontend/                 ← React App
    ├── package.json
    ├── public/index.html
    └── src/
        ├── index.js
        ├── App.js
        └── components/
            ├── Login.js / Login.css
            ├── Dashboard.js / Dashboard.css
            └── ValidationRuleCard.js / ValidationRuleCard.css
```

---

## 🚀 STEP-BY-STEP SETUP GUIDE

---

### STEP 1 — Sign up for a Salesforce Developer Org

1. Go to: https://developer.salesforce.com/signup
2. Fill in Name, Email, Role (Developer), Company, Country
3. Click **Sign me up**
4. Check your email → click activation link → set password
5. You now have a free Salesforce Developer Org ✅

---

### STEP 2 — Create 4–5 Validation Rules on the Account Object

1. Login to your Salesforce org (e.g. https://yourorg.my.salesforce.com)
2. Click ⚙️ **Setup** (top right gear icon)
3. In Quick Find search bar → type **Object Manager** → click it
4. Click **Account** in the object list
5. In left sidebar → click **Validation Rules**
6. Click **New** and create the following rules one by one:

---

**Rule 1 — Phone Required**
- Rule Name: `Phone_Required`
- Error Condition Formula: `ISBLANK(Phone)`
- Error Message: `Account Phone number is required.`
- Error Location: Top of Page
- Active: ✅ checked

**Rule 2 — Website Format Check**
- Rule Name: `Website_Format_Check`
- Error Condition Formula: `NOT(ISBLANK(Website)) && NOT(BEGINS(Website, "http"))`
- Error Message: `Website must start with http or https.`
- Active: ✅ checked

**Rule 3 — Annual Revenue Positive**
- Rule Name: `Annual_Revenue_Positive`
- Error Condition Formula: `NOT(ISBLANK(AnnualRevenue)) && AnnualRevenue < 0`
- Error Message: `Annual Revenue cannot be negative.`
- Active: ✅ checked

**Rule 4 — Billing State Required**
- Rule Name: `Billing_State_Required`
- Error Condition Formula: `ISBLANK(BillingState)`
- Error Message: `Billing State/Province is required.`
- Active: ✅ checked

**Rule 5 — Employee Count Positive**
- Rule Name: `Employee_Count_Positive`
- Error Condition Formula: `NOT(ISBLANK(NumberOfEmployees)) && NumberOfEmployees < 0`
- Error Message: `Number of Employees cannot be negative.`
- Active: ✅ checked

7. Save each rule. You should now have 5 validation rules on Account ✅

---

### STEP 3 — Create a Connected App in Salesforce

1. In Setup → Quick Find → type **App Manager** → click it
2. Click **New Connected App** (top right)
3. Fill in:
   - **Connected App Name**: `SF Validation Manager`
   - **API Name**: `SF_Validation_Manager` (auto-fills)
   - **Contact Email**: your email address
4. Under **OAuth Settings**:
   - ✅ Check **Enable OAuth Settings**
   - **Callback URL**: `http://localhost:5000/auth/callback`
   - **Selected OAuth Scopes** — Add these two:
     - `Access and manage your data (api)`
     - `Perform requests on your behalf at any time (refresh_token, offline_access)`
   - ✅ Check **Require Secret for Web Server Flow**
5. Click **Save** → then **Continue**
6. Wait 2–10 minutes for the app to be ready
7. Go back to App Manager → find your app → click ▼ **View**
8. Copy the **Consumer Key** (= Client ID)
9. Click **Click to reveal** under Consumer Secret and copy it

---

### STEP 4 — Set Up the Backend

```bash
# Navigate to backend folder
cd salesforce-validation-manager/backend

# Copy env template and fill in your values
cp .env.example .env
```

Now open `.env` and fill it in:

```env
SALESFORCE_CLIENT_ID=<paste Consumer Key here>
SALESFORCE_CLIENT_SECRET=<paste Consumer Secret here>
SALESFORCE_REDIRECT_URI=http://localhost:5000/auth/callback
SALESFORCE_LOGIN_URL=https://login.salesforce.com
SESSION_SECRET=mySecretKey123ChangeMeInProd
FRONTEND_URL=http://localhost:3000
PORT=5000
```

Then install dependencies and start the server:

```bash
npm install
npm run dev
```

You should see: ✅ Backend server running on http://localhost:5000

---

### STEP 5 — Set Up the Frontend

Open a NEW terminal tab/window:

```bash
cd salesforce-validation-manager/frontend
npm install
npm start
```

The React app will open at: http://localhost:3000

---

### STEP 6 — Test the Application

1. Open http://localhost:3000
2. Click **Login with Salesforce** → you'll be redirected to Salesforce
3. Log in with your developer org credentials
4. Click **Allow** to authorize the app
5. You'll be redirected to the Dashboard
6. Click **Get Validation Rules** to load all Account rules
7. Click toggle buttons to activate/deactivate individual rules
8. Click **Enable All** or **Disable All** to bulk update
9. Click **Deploy to Salesforce** to confirm and sync changes

---

### STEP 7 — Deploy Online (Render.com — Free)

**Deploy Backend on Render:**

1. Push your code to GitHub (make a new repo)
2. Go to https://render.com → Sign up free
3. New → **Web Service** → connect your GitHub repo
4. Settings:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. Add Environment Variables (same as your .env but with production URLs):
   - `SALESFORCE_REDIRECT_URI` = `https://your-backend.onrender.com/auth/callback`
   - `FRONTEND_URL` = `https://your-frontend.onrender.com`
   - (all other keys same as local)
6. Click **Create Web Service**

**Deploy Frontend on Render (Static Site):**

1. New → **Static Site** → connect same GitHub repo
2. Settings:
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`
3. Add Environment Variable:
   - `REACT_APP_API_URL` = `https://your-backend.onrender.com`
4. In `frontend/src/App.js`, change:
   ```js
   axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
   ```
5. Also update the Login.js redirect URL:
   ```js
   window.location.href = `${process.env.REACT_APP_API_URL}/auth/login`;
   ```
6. Deploy!
7. **Important**: After deployment, go back to Salesforce Connected App and add your
   production callback URL to the Callback URL list.

---

## ✅ Features Checklist (All Assignment Requirements)

| Requirement | Status | Where |
|---|---|---|
| Salesforce Developer Org | ✅ | Step 1 |
| 4–5 Validation Rules on Account | ✅ | Step 2 |
| Connected App | ✅ | Step 3 |
| OAuth 2.0 Login Button | ✅ | Login.js → `/auth/login` |
| Get All Validation Rules button | ✅ | Dashboard → `/api/rules` via Tooling API |
| Show rules with Active/Inactive state | ✅ | ValidationRuleCard.js |
| Toggle single rule on/off | ✅ | `/api/rules/:id/toggle` |
| Enable All / Disable All buttons | ✅ | `/api/rules/toggle-all` |
| Deploy changes to Salesforce | ✅ | `/api/deploy` |
| Deployed online | ✅ | Step 7 (Render.com) |

---

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router v6, Axios, React Toastify
- **Backend**: Node.js, Express, Axios, express-session
- **Auth**: Salesforce OAuth 2.0 Web Server Flow
- **Salesforce API**: Tooling API v59.0
- **Hosting**: Render.com (free tier)

---

## 📧 Submission

Send to: careers@cloudvandana.com
- GitHub repository link
- Deployed application link
- Updated resume

---

## ❓ Common Issues

**Error: redirect_uri_mismatch**
→ Make sure the Callback URL in your Connected App exactly matches `SALESFORCE_REDIRECT_URI` in `.env`

**Error: invalid_client_id**
→ Double-check your Consumer Key in `.env`

**"Not authenticated" error on API calls**
→ Session cookies require `credentials: true` on axios (already set) and CORS configured (already set)

**No validation rules showing**
→ Make sure you created the rules on the **Account** object (not Contact or Lead)
