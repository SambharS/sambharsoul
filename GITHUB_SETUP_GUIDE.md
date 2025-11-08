# 🚀 GitHub Setup Guide - Complete Instructions

## Step-by-Step GitHub Setup for Sambhar Soul

---

## 📋 Prerequisites

- [ ] Git installed on your system
- [ ] GitHub account created
- [ ] Repository created on GitHub (if not, we'll do it)

---

## 🔧 Step 1: Clean Up Existing Git (If Needed)

If you have an existing git setup that's causing issues, let's start fresh:

```bash
# Remove existing git repository (CAREFUL!)
Remove-Item -Path .git -Recurse -Force

# Verify it's removed
Get-ChildItem -Force
```

---

## 🆕 Step 2: Create GitHub Repository

### Option A: Via GitHub Website (Recommended)

1. Go to: https://github.com/new
2. Repository name: `sambhar-soul` (or your choice)
3. Description: "Food ordering PWA with push notifications and admin dashboard"
4. Visibility: **Private** (recommended) or Public
5. **DO NOT** initialize with README, .gitignore, or license
6. Click **Create repository**

### Option B: Via GitHub CLI (if installed)

```bash
gh repo create sambhar-soul --private --source=. --remote=origin
```

---

## 🎯 Step 3: Initialize Git Repository

Run these commands one by one:

```bash
# 1. Initialize git repository
git init

# 2. Add all files to staging
git add .

# 3. Create first commit
git commit -m "Initial commit: Sambhar Soul PWA - Complete food ordering system"

# 4. Rename branch to main
git branch -M main
```

---

## 🔗 Step 4: Connect to GitHub

Replace `YOUR_USERNAME` with your actual GitHub username:

```bash
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/sambhar-soul.git

# Verify remote was added
git remote -v
```

**Example**:
```bash
git remote add origin https://github.com/SambharS/sambharsoul.git
```

---

## 📤 Step 5: Push to GitHub

### First Time Push

```bash
# Push to GitHub
git push -u origin main
```

### If You Get Authentication Error

You'll need a Personal Access Token (PAT):

1. Go to: https://github.com/settings/tokens
2. Click **Generate new token** → **Generate new token (classic)**
3. Name: "Sambhar Soul Deploy"
4. Expiration: 90 days (or your choice)
5. Select scopes: **repo** (all checkboxes under repo)
6. Click **Generate token**
7. **COPY THE TOKEN** (you won't see it again!)

When pushing, use:
- Username: Your GitHub username
- Password: The token you just copied

---

## 🔐 Step 6: Save Credentials (Optional)

To avoid entering credentials every time:

```bash
# Store credentials
git config --global credential.helper store

# Or use Windows Credential Manager
git config --global credential.helper wincred
```

---

## ✅ Step 7: Verify Everything

```bash
# Check git status
git status

# Check remote
git remote -v

# Check branch
git branch
```

You should see:
- Clean working tree
- Remote pointing to your GitHub repo
- On branch `main`

---

## 📝 Complete Command Sequence

Here's the complete sequence to copy-paste (update YOUR_USERNAME):

```bash
# Clean start (only if needed)
# Remove-Item -Path .git -Recurse -Force

# Initialize
git init

# Add files
git add .

# Commit
git commit -m "Initial commit: Sambhar Soul PWA - Complete food ordering system with push notifications, analytics, and admin dashboard"

# Set branch name
git branch -M main

# Add remote (UPDATE YOUR_USERNAME!)
git remote add origin https://github.com/YOUR_USERNAME/sambhar-soul.git

# Push
git push -u origin main
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "remote origin already exists"

**Solution**:
```bash
# Remove existing remote
git remote remove origin

# Add it again
git remote add origin https://github.com/YOUR_USERNAME/sambhar-soul.git
```

### Issue 2: "failed to push some refs"

**Solution**:
```bash
# Pull first (if repo has files)
git pull origin main --allow-unrelated-histories

# Then push
git push -u origin main
```

### Issue 3: "Authentication failed"

**Solution**:
- Use Personal Access Token instead of password
- Follow Step 5 instructions above

### Issue 4: "LF will be replaced by CRLF"

**Solution**: This is just a warning, safe to ignore. Or configure:
```bash
git config --global core.autocrlf true
```

### Issue 5: ".env.local should not be committed"

**Solution**: It's already in .gitignore, you're safe!

---

## 📂 What Gets Pushed

### Included ✅
- All source code (`src/`)
- Public assets (`public/`)
- Configuration files
- Documentation (`.md` files)
- Database migrations (`db/`)

### Excluded ❌ (via .gitignore)
- `node_modules/`
- `.next/`
- `.env.local` (your secrets)
- Build artifacts
- Cache files

---

## 🔄 Future Updates

After initial setup, to push changes:

```bash
# 1. Check what changed
git status

# 2. Add changes
git add .

# 3. Commit with message
git commit -m "Your commit message here"

# 4. Push to GitHub
git push
```

---

## 🎯 Quick Commands Reference

```bash
# Check status
git status

# Add all files
git add .

# Add specific file
git add path/to/file.ts

# Commit
git commit -m "Your message"

# Push
git push

# Pull latest
git pull

# View history
git log --oneline

# View remotes
git remote -v

# View branches
git branch
```

---

## 📊 Repository Structure

Your GitHub repo will contain:

```
sambhar-soul/
├── src/                    # Source code
├── public/                 # Static assets
├── db/                     # Database migrations
├── .kiro/                  # Kiro IDE config
├── package.json            # Dependencies
├── README.md               # Project documentation
├── DEPLOYMENT_GUIDE.md     # Deployment instructions
└── ... (other files)
```

---

## 🚀 After Pushing to GitHub

### Next Steps:

1. **Verify on GitHub**
   - Go to your repository URL
   - Check all files are there
   - Verify .env.local is NOT there

2. **Deploy to Vercel**
   - Go to: https://vercel.com
   - Import your GitHub repository
   - Add environment variables
   - Deploy!

3. **Update README**
   - Add your Vercel URL
   - Update any specific instructions
   - Add badges (optional)

---

## 🔐 Security Checklist

Before pushing, verify:

- [ ] `.env.local` is in `.gitignore`
- [ ] No API keys in code
- [ ] No passwords in code
- [ ] Firebase credentials in environment variables only
- [ ] Supabase keys in environment variables only

---

## 📞 Need Help?

### If Commands Don't Work:

1. **Check Git Installation**:
   ```bash
   git --version
   ```

2. **Check Current Directory**:
   ```bash
   pwd  # or Get-Location in PowerShell
   ```

3. **Check Git Status**:
   ```bash
   git status
   ```

### Common Git Commands:

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# View what will be committed
git diff --staged

# Remove file from staging
git reset HEAD file.txt

# Discard changes in file
git checkout -- file.txt
```

---

## ✅ Success Indicators

You'll know it worked when:

1. ✅ `git status` shows "nothing to commit, working tree clean"
2. ✅ `git remote -v` shows your GitHub URL
3. ✅ Your GitHub repository page shows all files
4. ✅ Latest commit appears on GitHub
5. ✅ You can see your code on GitHub website

---

## 🎉 You're Done!

Once pushed successfully:
- Your code is backed up on GitHub
- You can deploy to Vercel
- You can collaborate with others
- You have version control

---

## 📝 Example Session

Here's what a successful session looks like:

```bash
PS F:\Downloads\SambharSoul> git init
Initialized empty Git repository in F:/Downloads/SambharSoul/.git/

PS F:\Downloads\SambharSoul> git add .
(warnings about CRLF are normal)

PS F:\Downloads\SambharSoul> git commit -m "Initial commit"
[main (root-commit) abc1234] Initial commit
 150 files changed, 15000 insertions(+)

PS F:\Downloads\SambharSoul> git branch -M main

PS F:\Downloads\SambharSoul> git remote add origin https://github.com/username/repo.git

PS F:\Downloads\SambharSoul> git push -u origin main
Enumerating objects: 200, done.
Counting objects: 100% (200/200), done.
Writing objects: 100% (200/200), 2.5 MiB | 1.2 MiB/s, done.
Total 200 (delta 50), reused 0 (delta 0)
To https://github.com/username/repo.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

**Ready to start?** Follow the steps above and you'll have your code on GitHub in minutes! 🚀
