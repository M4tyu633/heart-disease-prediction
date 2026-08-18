import os
import urllib.request
import pandas as pd

def fetch_dataset():
    os.makedirs("C:/Users/matth/heart-disease-prediction/data", exist_ok=True)
    out_path = "C:/Users/matth/heart-disease-prediction/data/heart_disease_uci.csv"
    
    # URL from standard raw repository
    url = "https://raw.githubusercontent.com/stefan-j/UCI-Heart-Disease-Dataset/master/heart_disease_uci.csv"
    
    try:
        print(f"Downloading dataset from {url}...")
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            content = response.read()
            with open(out_path, 'wb') as f:
                f.write(content)
        print("Downloaded successfully.")
    except Exception as e:
        print(f"Direct download error: {e}, falling back to alternative source...")
        alt_url = "https://raw.githubusercontent.com/PacktPublishing/Hands-On-Exploratory-Data-Analysis-with-Python/master/Chapter%205/heart.csv"
        req = urllib.request.Request(alt_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            content = response.read()
            with open(out_path, 'wb') as f:
                f.write(content)
    
    df = pd.read_csv(out_path)
    print("Dataset shape:", df.shape)
    print("Columns:", df.columns.tolist())
    print(df.head())

if __name__ == "__main__":
    fetch_dataset()
