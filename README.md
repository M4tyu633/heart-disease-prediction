# CardioSense AI — Heart Disease Risk Prediction Engine

An interactive clinical decision support system that predicts coronary artery disease (CAD) risk from patient biomarkers. Built on the 920-patient UCI Heart Disease dataset across 4 clinical hospitals, utilizing Scikit-learn, Random Forest, Gradient Boosting, and Logistic Regression with real-time SHAP / feature attribution breakdowns.

## 🩺 Clinical Overview & Problem Formulation
Coronary artery disease is the leading cause of global mortality. Early detection of >50% diameter stenosis in major epicardial coronary vessels allows timely intervention (statin therapy, lifestyle modification, stress echocardiography, or coronary angiography).

This system takes clinical patient hemodynamics, resting ECG, and stress test biomarkers to output a calibrated risk probability and individual feature attribution drivers.

## 📊 Dataset & Benchmarks
- **Dataset:** UCI Heart Disease Dataset (920 patient records from Cleveland, Hungary, Switzerland, and Long Beach VA).
- **Evaluation:** Strict 20% stratified holdout test split and 5-fold cross-validation.

| Model Architecture | Accuracy | Precision | Recall | F1 Score | Holdout ROC-AUC | 5-Fold CV AUC |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Random Forest** | **85.3%** | **85.1%** | **89.2%** | **87.1%** | **0.9193** | **0.8913 ± 0.018** |
| **Gradient Boosting** | 84.2% | 82.9% | 90.2% | 86.4% | 0.9171 | 0.8809 ± 0.015 |
| **Logistic Regression** | 83.2% | 82.6% | 88.2% | 85.3% | 0.9191 | 0.8845 ± 0.014 |

## 🧬 Key Diagnostic Drivers (Permutation Feature Importance)
1. **Chest Pain (Asymptomatic / Silent Ischemia):** `22.4%`
2. **Major Vessels Colored (Fluoroscopy `ca`):** `16.5%`
3. **Thalassemia (Reversible Defect):** `14.2%`
4. **ST Depression (`oldpeak`):** `11.8%`
5. **Max Heart Rate Achieved (`thalach`):** `9.8%`

## 🚀 Getting Started

### Python Model Training
```bash
pip install pandas scikit-learn numpy ucimlrepo
python train.py
```

### Next.js Interactive Web App
```bash
npm install
npm run dev
```

Built by **Matthew Labrador**.
