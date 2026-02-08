---
license: mit
base_model: Ultralytics/YOLO11
pipeline_tag: object-detection
language:
- en
tags:
- computervision
- yolo11
- yolo
- ultralytics
- Pytorch
---

# Model Card for `traffic-accident-detection-yolo11x`

This model is a fine-tuned version of the YOLOv11x object detection model, specialized for traffic accident detection using real-world surveillance data. It can detect and localize two main object categories: `accident` and `vehicle` in images or video frames.

## Model Details

### Model Description

- **Developed by:** Uppada Enos  
- **Shared by:** Uppada Enos  
- **Model type:** Object Detection (YOLOv11x-based)  
- **License:** MIT  
- **Finetuned from model:** Ultralytics/YOLO11  

## Uses

### Direct Use

This model can be directly used for:

- Real-time traffic surveillance  
- Automatic incident detection in smart cities  
- Analyzing video streams for safety monitoring  

### Out-of-Scope Use

- Not designed for multi-class general object detection  
- Not validated for use in critical autonomous driving systems  

## How to Get Started with the Model

```python
from ultralytics import YOLO

# Load the fine-tuned model
model = YOLO('path/to/best.pt')

# Run inference on an image
results = model('path/to/image.jpg')

# Visualize the results
results.show()
````

## Training Details

### Training Data

Dataset used: [Roboflow - Traffic Accident Detection](https://universe.roboflow.com/hilmantm/traffic-accident-detection)

### Training Hyperparameters

* **Epochs:** 61
* **Batch size:** 16
* **Learning rate:** 0.001
* **Optimizer:** SGD
* **Image size:** 640
* **Augmentations:** Mosaic, mixup, HSV shift, scaling, translation

## Evaluation

### Metrics

| Metric               | Value |
| -------------------- | ----- |
| mAP\@0.5             | 0.826 |
| mAP\@0.5:0.95        | 0.600 |
| Precision (all)      | 0.808 |
| Recall (all)         | 0.759 |
| F1-score (all)       | 0.782 |
| Precision (Accident) | 0.811 |
| Recall (Accident)    | 0.855 |
| F1-score (Accident)  | 0.833 |
| Precision (Vehicle)  | 0.805 |
| Recall (Vehicle)     | 0.663 |
| F1-score (Vehicle)   | 0.727 |

## Model Card Authors

Uppada Enos, with fine-tuning using Ultralytics' YOLOv11x architecture.

## Model Card Contact

For issues or contributions, reach out via the Hugging Face discussion tab or contact: [enosuppada2005@gmail.com](mailto:enosuppada2005@gmail.com)