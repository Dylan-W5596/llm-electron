from typing import List, Dict, Optional
import os
import sys

# 模型的全域路徑
MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models", "Llama-3.2-1B-Instruct-Q8_0.gguf"))

class ModelEngine:
    def __init__(self):
        self.llm = None
        self.has_gpu = False
        
    def load_model(self):
        if self.llm:
            return

        print(f"正在載入模型，位置: {MODEL_PATH}")
        if not os.path.exists(MODEL_PATH):
            print("找不到模型檔案！請先下載模型。")
            raise FileNotFoundError(f"在 {MODEL_PATH} 找不到模型")

        try:
            # 顯式添加 CUDA DLL 搜尋路徑 (針對 Windows 且 Python 3.8+)
            if sys.platform == "win32":
                cuda_paths = [
                    r"C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.1\bin",
                    r"C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.0\bin",
                    r"C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.4\bin",
                    r"C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.1\bin",
                    # 嘗試包含 LM Studio 攜帶的程式庫
                    os.path.expanduser(r"~\.lmstudio\extensions\backends\vendor\win-llama-cuda12-vendor-v2")
                ]
                for path in cuda_paths:
                    if os.path.exists(path):
                        print(f"正在將 DLL 目錄加入搜尋路徑: {path}")
                        try:
                            os.add_dll_directory(path)
                        except Exception as e:
                            print(f"預警：無法加入目錄 {path}: {e}")

            from llama_cpp import Llama
            # 嘗試使用 CUDA 載入 (n_gpu_layers=-1 表示全部層都在 GPU 上)
            # context_window=2048 是預設值，Llama 3.2 1B 通常支援更多 (128k)，但本地通常保持較低以節省 RAM。
            # Llama 3.2 1B 上下文為 128k，但為了速度/記憶體，除非有要求，否則讓我們保持在 8192。
            self.llm = Llama(
                model_path=MODEL_PATH,
                n_gpu_layers=-1, # 將所有層卸載至 GPU
                n_ctx=8192,      # 合理的上下文長度
                verbose=True
            )
            self.has_gpu = True # 假設已卸載，請檢查實際日誌
            print("已使用 llama-cpp-python 成功載入模型。")
        except ImportError as e:
            import traceback
            print("尚未安裝 llama-cpp-python 或載入失敗。")
            print("若您遇到 DLL 載入錯誤，請確認以下事項：")
            print("1. 若使用 CUDA 版，請確認已安裝 NVIDIA CUDA Toolkit 12.x 或 13.x。")
            print("2. 請確保已安裝 'Microsoft Visual C++ Redistributable' (最新版)。")
            print(f"詳細錯誤: {e}")
            traceback.print_exc()
            self.llm = None
        except Exception as e:
            import traceback
            print("若看到 'Failed to load shared library'，通常代表缺少系統驅動程式 (CUDA Toolkit) 或 VC++ Redistributable。")
            print(f"載入模型時發生未預期的錯誤: {e}")
            traceback.print_exc()
            self.llm = None

    def is_loaded(self):
        return self.llm is not None

    def generate(self, messages: List[Dict[str, str]]) -> str:
        """
        messages: [{"role": "user", "content": "..."}, ...]
        """
        if not self.llm:
            self.load_model()
        
        if not self.llm:
            return "錯誤: 模型未載入。"

        # Llama 3 聊天格式
        # <|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\nSystem Prompt<|eot_id|><|start_header_id|>user<|end_header_id|>\n\nUser Input<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n
        
        # 幸運的是 llama-cpp-python 通常內建聊天處理器，但讓我們確定一下。
        # 或者我們手動格式化。Llama 3.2 使用標準 Llama 3 instruct 格式。
        
        try:
            response = self.llm.create_chat_completion(
                messages=messages,
                max_tokens=1024,
                stop=["<|eot_id|>", "<|end_of_text|>"],
                temperature=0.7
            )
            return response["choices"][0]["message"]["content"]
        except Exception as e:
            return f"生成過程中發生錯誤: {e}"
