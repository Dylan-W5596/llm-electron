import os
import urllib.request
import sys

MODEL_URL = "https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q8_0.gguf"
MODEL_DIR = "models"
MODEL_PATH = os.path.join(MODEL_DIR, "Llama-3.2-1B-Instruct-Q8_0.gguf")

def download_model():
    if not os.path.exists(MODEL_DIR):
        os.makedirs(MODEL_DIR)
    
    if os.path.exists(MODEL_PATH):
        print(f"模型已存在於 {MODEL_PATH}")
        return

    print(f"正在從 {MODEL_URL} 下載模型...")
    
    def reporthook(blocknum, blocksize, totalsize):
        readsoar = blocknum * blocksize
        if totalsize > 0:
            percent = readsoar * 1e2 / totalsize
            s = "\r%5.1f%% %*d / %d" % (
                percent, len(str(totalsize)), readsoar, totalsize)
            sys.stderr.write(s)
            if readsoar >= totalsize: # 快結束時
                sys.stderr.write("\n")
    
    try:
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH, reporthook)
        print("下載完成。")
    except Exception as e:
        print(f"下載失敗: {e}")
        sys.exit(1)

if __name__ == "__main__":
    download_model()
