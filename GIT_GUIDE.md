# Git Setup and Deployment Guide

## Initial Git Setup

The project was already initialized with Git during create-react-app setup. Here's how to push it to GitHub:

### 1. Create GitHub Repository

1. Go to https://github.com
2. Click "New repository"
3. Name it "pharmacy-store" or "pharmacare-online"
4. Don't initialize with README (we already have one)
5. Click "Create repository"

### 2. Connect Local Repository to GitHub

```bash
cd pharmacy-store

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/pharmacy-store.git

# Verify the remote was added
git remote -v

# Check current status
git status

# Add all files to staging
git add .

# Commit the changes
git commit -m "Initial commit: Phase 1 - Frontend implementation with React"

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Making Changes and Committing

```bash
# Check what files have changed
git status

# Add specific files
git add src/pages/Home.js

# Or add all changes
git add .

# Commit with a descriptive message
git commit -m "Add: Home page hero section"

# Push changes to GitHub
git push
```

### 4. Good Commit Message Examples

```bash
git commit -m "Add: Product filtering functionality"
git commit -m "Fix: Cart quantity update bug"
git commit -m "Update: Navbar responsive design"
git commit -m "Refactor: Products component structure"
git commit -m "Docs: Update README with setup instructions"
```

### 5. View Commit History

```bash
# View commit history
git log

# View simplified history
git log --oneline

# View history with graph
git log --graph --oneline --all
```

## Deploy to GitHub Pages

### Install gh-pages

```bash
npm install --save-dev gh-pages
```

### Update package.json

Add these lines to your `package.json`:

```json
{
  "homepage": "https://YOUR_USERNAME.github.io/pharmacy-store",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build",
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

### Deploy

```bash
npm run deploy
```

This will:
1. Build your project
2. Create a `gh-pages` branch
3. Push the build folder to GitHub Pages
4. Your site will be live at: `https://YOUR_USERNAME.github.io/pharmacy-store`

### Update Deployment

Whenever you make changes:

```bash
# 1. Commit your changes
git add .
git commit -m "Update: Your changes"
git push

# 2. Redeploy to GitHub Pages
npm run deploy
```

## Git Best Practices

### 1. Commit Frequently
- Make small, focused commits
- Commit after completing each feature
- Don't commit broken code

### 2. Write Clear Commit Messages
- Use present tense: "Add feature" not "Added feature"
- Be descriptive but concise
- Explain what and why, not how

### 3. Use Branches for Features (Optional)
```bash
# Create a new branch
git checkout -b feature/shopping-cart

# Work on your feature
# ... make changes ...

# Commit changes
git add .
git commit -m "Add: Shopping cart functionality"

# Switch back to main
git checkout main

# Merge the feature
git merge feature/shopping-cart
```

### 4. Keep Repository Clean
```bash
# See what will be removed
git clean -n

# Remove untracked files
git clean -f

# Remove untracked directories
git clean -fd
```

### 5. Check Before Committing
```bash
# See what changed
git diff

# See staged changes
git diff --staged

# Check status
git status
```

## Troubleshooting

### Problem: Can't push to GitHub
```bash
# Solution 1: Pull first
git pull origin main

# Solution 2: Force push (only if necessary)
git push -f origin main
```

### Problem: Merge conflicts
```bash
# 1. See conflicted files
git status

# 2. Open files and resolve conflicts
# (Look for <<<<<<, ======, >>>>>> markers)

# 3. After resolving, add and commit
git add .
git commit -m "Resolve merge conflicts"
```

### Problem: Wrong commit message
```bash
# Change last commit message
git commit --amend -m "New message"
```

### Problem: Need to undo last commit
```bash
# Keep changes, undo commit
git reset --soft HEAD~1

# Discard changes, undo commit
git reset --hard HEAD~1
```

## Repository Structure for Submission

Your final repository should include:

```
pharmacy-store/
├── src/                    # Source code
├── public/                 # Public assets
├── README.md              # Project documentation
├── PROJECT_REPORT.md      # Detailed report
├── DEPLOYMENT.md          # Deployment guide
├── package.json           # Dependencies
├── .gitignore            # Git ignore rules
└── screenshots/          # UI screenshots (add this)
```

## Adding Screenshots

```bash
# 1. Create screenshots folder
mkdir screenshots

# 2. Take screenshots of your app
# Save them as: home-page.png, products-page.png, etc.

# 3. Add to git
git add screenshots/
git commit -m "Add: Project screenshots"
git push
```

## Final Checklist

Before submission, make sure:
- ✅ All code is committed and pushed
- ✅ README.md is complete and accurate
- ✅ Project is deployed to GitHub Pages
- ✅ All screenshots are added
- ✅ Repository is public
- ✅ Commit history shows regular progress
- ✅ .gitignore excludes node_modules

## Important Notes

- Never commit `node_modules/` folder (it's already in .gitignore)
- Never commit `.env` files with sensitive data
- Make regular commits (aim for at least 10-15 commits)
- Write meaningful commit messages
- Test your deployed site before submission

## Get Repository Link for Submission

Your GitHub repository URL will be:
```
https://github.com/YOUR_USERNAME/pharmacy-store
```

Your deployed site URL will be:
```
https://YOUR_USERNAME.github.io/pharmacy-store
```

Submit both links in your project report!
