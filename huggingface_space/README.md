---
title: Microplastic Detector
emoji: 🔬
colorFrom: blue
colorTo: green
sdk: docker
app_file: app.py
pinned: false
license: mit
---

# Microplastic Detection System

This Space uses a Faster R-CNN model (ResNet-50 FPN backbone) trained to detect microplastics in images.

## Model Performance
- **Precision**: ~75%
- **Recall**: ~64%
- **F1 Score**: ~67%

## Usage
1. Upload an image containing potential microplastics
2. Click "Detect Microplastics"
3. View annotated results with bounding boxes and confidence scores

## API Access
This Space provides an automatic API endpoint. You can call it programmatically:

```python
from gradio_client import Client

client = Client("YOUR_USERNAME/microplastic-detector")
result = client.predict(
    image="path/to/image.jpg",
    api_name="/predict"
)
```

## Model Training
Model was trained for 50 epochs using PyTorch on a microplastic detection dataset.
