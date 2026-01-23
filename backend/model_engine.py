from typing import List, Dict, Optional
import os
import sys
from rich.console import Console
from rich.panel import Panel
from rich.theme import Theme

# 定義主題
custom_theme = Theme({
    "info": "dim cyan",
    "warning": "magenta",
    "danger": "bold red",
    "success": "bold green"
})

# 強制使用 UTF-8 輸出以減少 Windows 編碼報錯，雖然仍受限於終端機能否顯示
console = Console(theme=custom_theme, force_terminal=True, legacy_windows=None)

# 模型的全域路徑
MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models", "Llama-3.2-1B-Instruct-Q8_0.gguf"))

class ModelEngine:
    def __init__(self):
        self.llm = None
        self.has_gpu = False
        
    def load_model(self):
        if self.llm:
            return

        console.print(Panel(f"正在載入模型，位置: [bold yellow]{MODEL_PATH}[/bold yellow]", title="[bold blue]AI 引擎初始化[/bold blue]", border_style="blue"))
        
        if not os.path.exists(MODEL_PATH):
            console.print("[danger]找不到模型檔案！請先下載模型。[/danger]")
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
                        console.print(f"[info]正在將 DLL 目錄加入搜尋路徑: {path}[/info]")
                        try:
                            # 即使目錄不存在也會報錯，我們已經檢查過 exists
                            os.add_dll_directory(path)
                        except Exception as e:
                            console.print(f"[warning]無法加入目錄 {path}: {e}[/warning]")

            from llama_cpp import Llama
            # 嘗試使用 CUDA 載入
            # 注意: 這裡我們移除 Emoji ✅ 以防止 Windows CP950 編碼報錯
            self.llm = Llama(
                model_path=MODEL_PATH,
                n_gpu_layers=-1, # 將所有層卸載至 GPU
                n_ctx=8192,      # 合理的上下文長度
                verbose=False    # 減少 llama.cpp 的原始輸出以保持介面乾淨
            )
            self.has_gpu = True
            console.print(Panel("[success]已使用 llama-cpp-python 成功載入模型 (CUDA 加速已啟用)[/success]", border_style="green"))
            
        except ImportError as e:
            console.print(Panel(f"[danger]尚未安裝 llama-cpp-python 或載入失敗。[/danger]\n詳細錯誤: {e}", title="載入錯誤", border_style="red"))
            self.llm = None
        except Exception as e:
            # 移除所有可能無法在 CP950 顯示的特殊字元
            console.print(Panel(
                f"[danger]載入模型時發生未預期的錯誤[/danger]\n\n"
                f"這通常代表系統環境缺少相依檔案。\n"
                f"建議檢查: [bold]NVIDIA CUDA Toolkit[/bold] 或 [bold]VC++ Redistributable[/bold]\n\n"
                f"系統詳細報錯: {str(e)}", 
                title="引擎啟動失敗", 
                border_style="red"
            ))
            self.llm = None

    def is_loaded(self):
        return self.llm is not None

    def generate(self, messages: List[Dict[str, str]]) -> str:
        """
        messages: [{"role": "user", "content": "..."}, ...]
        """
        if not self.llm:
            try:
                self.load_model()
            except Exception:
                return "錯誤: 模型載入失敗，請檢查後端日誌。"
        
        if not self.llm:
            return "錯誤: 模型未載入。"

        try:
            # 安全輸出日誌
            last_msg = messages[-1]["content"] if messages else ""
            log_text = f"USER > {last_msg[:30].strip()}..."
            console.print(log_text, style="cyan")
            
            response = self.llm.create_chat_completion(
                messages=messages,
                max_tokens=1024,
                stop=["<|eot_id|>", "<|end_of_text|>"],
                temperature=0.7
            )
            
            ans = response["choices"][0]["message"]["content"]
            ans_display = ans[:30].strip().replace("\n", " ")
            console.print(f"AI   > {ans_display}...", style="dim green")
            return ans
        except Exception as e:
            # 極其保守的錯誤輸出
            try:
                console.print(f"Error during generation: {str(e)}", style="bold red")
            except:
                print(f"Error during generation (plain): {str(e)}")
            return f"生成過程中發生錯誤: {str(e)}"
