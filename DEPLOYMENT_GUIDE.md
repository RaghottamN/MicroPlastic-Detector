# 🔬 Microplastic Detection System - Deployment Guide

Complete guide to deploy your Faster R-CNN microplastic detection model.

---

## 📁 Project Structure

```
Basket_course-EL/
├── Model/
│   └── fasterrcnn_microplastic_epoch48.pth   # Your trained model (165MB)
├── huggingface_space/                         # Backend - Deploy to HF
│   ├── app.py                                 # Gradio API application
│   ├── requirements.txt                       # Python dependencies
│   └── README.md                              # Space configuration
└── frontend/                                  # Frontend - Deploy to GitHub Pages
    ├── index.html
    ├── style.css
    └── script.js
```

---

## 🚀 Step 1: Deploy Backend to Hugging Face Spaces

### 1.1 Create Hugging Face Account
1. Go to https://huggingface.co
2. Create a free account
3. Verify your email

### 1.2 Create a New Space
1. Click your profile → **New Space**
2. Configure:
   - **Space name**: `microplastic-detector`
   - **License**: MIT
   - **SDK**: Gradio
   - **Hardware**: CPU Basic (free) or GPU if needed
3. Click **Create Space**

### 1.3 Upload Files
**Option A: Using Git (Recommended)**
```bash
# Clone your space
git clone https://huggingface.co/spaces/YOUR_USERNAME/microplastic-detector
cd microplastic-detector

# Install Git LFS for large files
git lfs install
git lfs track "*.pth"

# Copy files
copy ..\huggingface_space\* .
copy ..\Model\fasterrcnn_microplastic_epoch48.pth .

# Push to Hugging Face
git add .
git commit -m "Initial deployment"
git push
```

**Option B: Using Web Interface**
1. Go to your Space's "Files" tab
2. Upload `app.py`, `requirements.txt`, `README.md`
3. Upload `fasterrcnn_microplastic_epoch48.pth` (HF handles large files)

### 1.4 Verify Deployment
1. Wait for the Space to build (2-5 minutes)
2. Access: `https://huggingface.co/spaces/YOUR_USERNAME/microplastic-detector`
3. Test by uploading an image

---

## 🌐 Step 2: Configure Frontend

### 2.1 Update API URL
Edit `frontend/script.js` line 13:
```javascript
API_URL: 'https://YOUR_USERNAME-microplastic-detector.hf.space',
```
Replace `YOUR_USERNAME` with your actual Hugging Face username.

---

## 🌍 Step 3: Deploy Frontend

### Option A: GitHub Pages (Free)
1. Create a GitHub repository
2. Push the `frontend/` folder contents
3. Go to Settings → Pages
4. Select branch: `main`, folder: `/ (root)`
5. Your site: `https://YOUR_GITHUB_USERNAME.github.io/REPO_NAME`

### Option B: Vercel (Free)
1. Go to https://vercel.com
2. Import your GitHub repo
3. Deploy automatically

### Option C: Netlify (Free)
1. Go to https://netlify.com
2. Drag and drop the `frontend/` folder
3. Get instant URL

---

## ✅ Step 4: Test the System

1. Open your deployed frontend URL
2. Upload a microplastic image
3. Verify:
   - ✅ Image displays correctly
   - ✅ Bounding boxes appear
   - ✅ Confidence scores shown
   - ✅ Detection count updates

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| API returns 404 | Check Space is running, verify URL |
| CORS error | HF Spaces have CORS enabled by default |
| Model not loading | Check file name matches in app.py |
| Slow inference | Consider upgrading to GPU on HF |

---

## 💡 Tips

- **Local Testing**: You can test the Gradio app locally:
  ```bash
  cd huggingface_space
  pip install -r requirements.txt
  python app.py
  ```

- **API Documentation**: Hugging Face provides automatic API docs at:
  `https://YOUR_USERNAME-microplastic-detector.hf.space/?view=api`

- **Rate Limits**: Free tier has generous limits for personal projects

---

## 📞 Need Help?

- Hugging Face Docs: https://huggingface.co/docs/hub/spaces
- Gradio Docs: https://gradio.app/docs/
