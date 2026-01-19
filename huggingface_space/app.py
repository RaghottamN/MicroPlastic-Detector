"""
Microplastic Detection API - Hugging Face Space
Uses Faster R-CNN (ResNet-50 FPN) trained on microplastic dataset
"""

import torch
import gradio as gr
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from torchvision.transforms import ToTensor
from torchvision.models.detection import fasterrcnn_resnet50_fpn

# Configuration
MODEL_PATH = "fasterrcnn_microplastic_epoch48.pth"
CONFIDENCE_THRESHOLD = 0.5
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
CLASS_NAMES = {1: "Microplastic"}

# Load model once at startup
def load_model():
    """Load the trained Faster R-CNN model"""
    model = fasterrcnn_resnet50_fpn(weights=None, num_classes=2)
    model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
    model.to(DEVICE)
    model.eval()
    return model

print(f"Loading model on {DEVICE}...")
model = load_model()
print("Model loaded successfully!")


def detect_microplastics(image):
    """
    Detect microplastics in the input image
    
    Args:
        image: PIL Image or numpy array
        
    Returns:
        annotated_image: PIL Image with bounding boxes drawn
        results: dict with detection details
    """
    if image is None:
        return None, {"error": "No image provided"}
    
    # Convert to PIL if needed
    if isinstance(image, np.ndarray):
        image = Image.fromarray(image).convert("RGB")
    else:
        image = image.convert("RGB")
    
    # Prepare image tensor
    img_tensor = ToTensor()(image).unsqueeze(0).to(DEVICE)
    
    # Run inference
    with torch.no_grad():
        outputs = model(img_tensor)[0]
    
    # Filter by confidence threshold
    mask = outputs["scores"] > CONFIDENCE_THRESHOLD
    boxes = outputs["boxes"][mask].cpu().numpy()
    scores = outputs["scores"][mask].cpu().numpy()
    labels = outputs["labels"][mask].cpu().numpy()
    
    # Draw bounding boxes on image
    annotated_image = image.copy()
    draw = ImageDraw.Draw(annotated_image)
    
    # Try to load a font, fall back to default
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
    except:
        font = ImageFont.load_default()
    
    detections = []
    for i, (box, score, label) in enumerate(zip(boxes, scores, labels)):
        x1, y1, x2, y2 = box.astype(int)
        
        # Draw box
        color = "#00FF00"  # Green
        draw.rectangle([x1, y1, x2, y2], outline=color, width=3)
        
        # Draw label
        label_text = f"Microplastic: {score:.2f}"
        text_bbox = draw.textbbox((x1, y1), label_text, font=font)
        draw.rectangle([text_bbox[0]-2, text_bbox[1]-2, text_bbox[2]+2, text_bbox[3]+2], fill=color)
        draw.text((x1, y1), label_text, fill="black", font=font)
        
        detections.append({
            "id": i + 1,
            "confidence": float(score),
            "bbox": [int(x1), int(y1), int(x2), int(y2)]
        })
    
    # Create results summary
    results = {
        "total_detections": len(detections),
        "confidence_threshold": CONFIDENCE_THRESHOLD,
        "detections": detections
    }
    
    return annotated_image, results


# Create Gradio interface
with gr.Blocks(title="Microplastic Detector", theme=gr.themes.Soft()) as demo:
    gr.Markdown(
        """
        # 🔬 Microplastic Detection System
        Upload an image to detect microplastics using our trained Faster R-CNN model.
        
        **Model Details:**
        - Architecture: Faster R-CNN with ResNet-50 FPN backbone
        - Confidence Threshold: 50%
        """
    )
    
    with gr.Row():
        with gr.Column():
            input_image = gr.Image(
                label="Upload Image",
                type="pil",
                height=400
            )
            detect_btn = gr.Button("🔍 Detect Microplastics", variant="primary", size="lg")
        
        with gr.Column():
            output_image = gr.Image(
                label="Detection Results",
                type="pil",
                height=400
            )
            output_json = gr.JSON(label="Detection Details")
    
    # Examples (optional - add your own sample images)
    # gr.Examples(
    #     examples=["sample1.jpg", "sample2.jpg"],
    #     inputs=input_image
    # )
    
    detect_btn.click(
        fn=detect_microplastics,
        inputs=input_image,
        outputs=[output_image, output_json],
        api_name="predict"
    )

# Launch
if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
