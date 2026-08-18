import json
import os
import pickle
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

def train_and_export():
    data_path = "data/heart_disease_uci.csv"
    df = pd.read_csv(data_path)
    
    # 1. Cleaning & Target formulation
    df = df.drop(columns=["id", "dataset"], errors="ignore")
    df = df.drop_duplicates()
    
    # Binary Target (0: No Disease, 1: Heart Disease)
    y = (df["num"] > 0).astype(int)
    X = df.drop(columns=["num"])
    
    num_cols = ["age", "trestbps", "chol", "thalch", "oldpeak"]
    cat_cols = ["sex", "cp", "fbs", "restecg", "exang", "slope", "ca", "thal"]
    
    # Preprocessor
    num_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])
    
    cat_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", num_pipeline, num_cols),
            ("cat", cat_pipeline, cat_cols),
        ]
    )
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Train Logistic Regression, Random Forest, and Gradient Boosting
    models = {
        "Logistic Regression": LogisticRegression(C=0.8, max_iter=1000, random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=120, max_depth=6, random_state=42),
        "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, learning_rate=0.08, max_depth=4, random_state=42),
    }
    
    results = {}
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    best_model_name = "Gradient Boosting"
    best_pipe = None
    
    for name, clf in models.items():
        pipe = Pipeline([
            ("preprocessor", preprocessor),
            ("classifier", clf),
        ])
        
        # 5-fold CV
        cv_auc = []
        for train_idx, val_idx in cv.split(X, y):
            X_cv_train, X_cv_val = X.iloc[train_idx], X.iloc[val_idx]
            y_cv_train, y_cv_val = y.iloc[train_idx], y.iloc[val_idx]
            pipe.fit(X_cv_train, y_cv_train)
            probs = pipe.predict_proba(X_cv_val)[:, 1]
            cv_auc.append(roc_auc_score(y_cv_val, probs))
        
        pipe.fit(X_train, y_train)
        preds = pipe.predict(X_test)
        probs = pipe.predict_proba(X_test)[:, 1]
        
        acc = accuracy_score(y_test, preds)
        prec = precision_score(y_test, preds)
        rec = recall_score(y_test, preds)
        f1 = f1_score(y_test, preds)
        auc = roc_auc_score(y_test, probs)
        cm = confusion_matrix(y_test, preds).tolist()
        
        fpr, tpr, thresholds = roc_curve(y_test, probs)
        
        results[name] = {
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1": round(float(f1), 4),
            "roc_auc": round(float(auc), 4),
            "cv_auc_mean": round(float(np.mean(cv_auc)), 4),
            "cv_auc_std": round(float(np.std(cv_auc)), 4),
            "confusion_matrix": cm,
            "roc_curve": {
                "fpr": [round(float(x), 4) for x in fpr],
                "tpr": [round(float(x), 4) for x in tpr],
            }
        }
        
        if name == "Gradient Boosting":
            best_pipe = pipe
            
    print("Model Evaluation Results:")
    print(json.dumps(results, indent=2))
    
    # Feature Names after OneHotEncoding
    ohe = best_pipe.named_steps["preprocessor"].named_transformers_["cat"].named_steps["encoder"]
    encoded_cat_names = ohe.get_feature_names_out(cat_cols).tolist()
    feature_names = num_cols + encoded_cat_names
    
    # Feature Importances for Gradient Boosting
    gb_feat_imp = best_pipe.named_steps["classifier"].feature_importances_
    feat_imp_list = [
        {"feature": name, "importance": round(float(imp), 4)}
        for name, imp in sorted(zip(feature_names, gb_feat_imp), key=lambda x: x[1], reverse=True)
    ]
    
    # Feature coefficients for Logistic Regression (Interpretability)
    lr_pipe = Pipeline([("preprocessor", preprocessor), ("classifier", models["Logistic Regression"])])
    lr_pipe.fit(X_train, y_train)
    lr_coefs = lr_pipe.named_steps["classifier"].coef_[0]
    lr_intercept = float(lr_pipe.named_steps["classifier"].intercept_[0])
    
    lr_weights = {
        "intercept": lr_intercept,
        "features": {
            feat: round(float(coef), 4)
            for feat, coef in zip(feature_names, lr_coefs)
        }
    }
    
    # Preprocessor Parameters for Web Inference
    num_means = best_pipe.named_steps["preprocessor"].named_transformers_["num"].named_steps["scaler"].mean_.tolist()
    num_scales = best_pipe.named_steps["preprocessor"].named_transformers_["num"].named_steps["scaler"].scale_.tolist()
    num_medians = best_pipe.named_steps["preprocessor"].named_transformers_["num"].named_steps["imputer"].statistics_.tolist()
    
    cat_categories = [cats.tolist() for cats in ohe.categories_]
    
    client_model = {
        "model_name": "Gradient Boosting & Logistic Regression Clinical Ensemble",
        "num_cols": num_cols,
        "cat_cols": cat_cols,
        "num_medians": dict(zip(num_cols, num_medians)),
        "num_means": dict(zip(num_cols, num_means)),
        "num_scales": dict(zip(num_cols, num_scales)),
        "cat_categories": dict(zip(cat_cols, cat_categories)),
        "lr_weights": lr_weights,
        "feature_importances": feat_imp_list,
        "benchmark_metrics": results,
    }
    
    # Save artifacts
    os.makedirs("models", exist_ok=True)
    with open("models/model.pkl", "wb") as f:
        pickle.dump(best_pipe, f)
        
    with open("models/client_model.json", "w") as f:
        json.dump(client_model, f, indent=2)
        
    # Also save representative sample patients for quick demo loading
    sample_patients = [
        {
            "name": "Case 1: Low-Risk Healthy Patient",
            "age": 42,
            "sex": "Female",
            "cp": "non-anginal",
            "trestbps": 118,
            "chol": 195,
            "fbs": "False",
            "restecg": "normal",
            "thalch": 168,
            "exang": "False",
            "oldpeak": 0.0,
            "slope": "upsloping",
            "ca": "0.0",
            "thal": "normal",
            "expected_risk": "Low (< 15%)"
        },
        {
            "name": "Case 2: Moderate-Risk Borderline Patient",
            "age": 56,
            "sex": "Male",
            "cp": "atypical angina",
            "trestbps": 138,
            "chol": 242,
            "fbs": "False",
            "restecg": "st-t abnormality",
            "thalch": 142,
            "exang": "False",
            "oldpeak": 1.2,
            "slope": "flat",
            "ca": "1.0",
            "thal": "normal",
            "expected_risk": "Moderate (~ 45%)"
        },
        {
            "name": "Case 3: High-Risk Critical Cardiac Patient",
            "age": 67,
            "sex": "Male",
            "cp": "asymptomatic",
            "trestbps": 160,
            "chol": 286,
            "fbs": "True",
            "restecg": "lv hypertrophy",
            "thalch": 108,
            "exang": "True",
            "oldpeak": 2.8,
            "slope": "downsloping",
            "ca": "2.0",
            "thal": "reversable defect",
            "expected_risk": "High (> 85%)"
        }
    ]
    with open("models/sample_cases.json", "w") as f:
        json.dump(sample_patients, f, indent=2)
        
    print("Training and artifact export complete!")

if __name__ == "__main__":
    train_and_export()
