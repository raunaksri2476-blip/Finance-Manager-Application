import sys
import re
import gzip
import time
import statistics
import urllib.request
from datetime import datetime
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

CURRENT_DIR = Path(__file__).resolve().parent
WORKSPACE_ROOT = CURRENT_DIR if (CURRENT_DIR / "dist").exists() else CURRENT_DIR.parent
DIST_DIR = WORKSPACE_ROOT / "dist"
SRC_DIR = WORKSPACE_ROOT / "src"
TARGET_URL = "http://localhost:3000/"

# Thresholds
MAX_GZIP_BUNDLE_KB = 500.0  # Max gzipped JS bundle threshold in KB
MAX_LATENCY_MS = 300.0      # Max TTFB / response latency threshold in ms
FORBIDDEN_PATTERNS = [
    r"sb_secret_[a-zA-Z0-9_\-]+",
    r"SUPABASE_SERVICE_ROLE_KEY\s*=\s*['\"][^'\"]+['\"]",
    r"-----BEGIN (RSA |EC )?PRIVATE KEY-----",
]


def log_step(test_id: str, title: str, status: str, metric: str, threshold: str):
    ts = datetime.now().strftime("%H:%M:%S.%f")[:-3]
    print(f"[{ts}] [{status}] {test_id}: {title} -> {metric} (Threshold: {threshold})")


def run_non_functional_tests():
    print("=" * 94)
    print("  MYBUDGET / FINANCE MANAGER - AUTOMATED NON-FUNCTIONAL TEST SUITE (PERFORMANCE & SECURITY)")
    print(f"  Workspace Root  : {WORKSPACE_ROOT}")
    print(f"  Target Endpoint : {TARGET_URL}")
    print(f"  Execution Time  : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 94)

    summary_rows = []

    # -------------------------------------------------------------------------
    # NFT-01: Asset Bundle Size Check
    # -------------------------------------------------------------------------
    assets_dir = DIST_DIR / "assets"
    assert assets_dir.exists(), f"Production build directory not found at {assets_dir}. Run `npm run build` first."

    js_files = list(assets_dir.glob("*.js"))
    css_files = list(assets_dir.glob("*.css"))
    assert len(js_files) > 0, "No compiled JS bundle found in dist/assets"

    total_raw_kb = 0.0
    total_gzip_kb = 0.0
    is_minified = True

    for f in js_files + css_files:
        raw_bytes = f.read_bytes()
        gzip_bytes = gzip.compress(raw_bytes)
        total_raw_kb += len(raw_bytes) / 1024.0
        total_gzip_kb += len(gzip_bytes) / 1024.0
        if f.suffix == ".js":
            lines = raw_bytes.decode("utf-8", errors="ignore").splitlines()
            avg_line_len = len(raw_bytes) / max(len(lines), 1)
            if avg_line_len < 80:
                is_minified = False

    assert is_minified, "JS bundle does not appear to be minified"
    assert total_gzip_kb <= MAX_GZIP_BUNDLE_KB, (
        f"Gzipped bundle size {total_gzip_kb:.2f} KB exceeds {MAX_GZIP_BUNDLE_KB} KB"
    )

    nft1_metric = f"{total_gzip_kb:.2f} KB gzip ({total_raw_kb:.1f} KB raw, Minified)"
    log_step("NFT-01", "Asset Bundle Size & Minification Check", "PASS", nft1_metric, f"<= {MAX_GZIP_BUNDLE_KB:.0f} KB gzip")
    summary_rows.append(("NFT-01", "Asset Bundle Size Check", nft1_metric, f"<= {MAX_GZIP_BUNDLE_KB:.0f} KB", "PASS"))

    # -------------------------------------------------------------------------
    # NFT-02: Endpoint Response Time / Latency Benchmark
    # -------------------------------------------------------------------------
    latencies_ms = []
    status_codes = []
    num_samples = 10

    for _ in range(num_samples):
        t0 = time.perf_counter()
        req = urllib.request.Request(TARGET_URL, method="GET")
        with urllib.request.urlopen(req, timeout=5) as resp:
            _ = resp.read()
            status_codes.append(resp.status)
        latencies_ms.append((time.perf_counter() - t0) * 1000.0)

    avg_latency = statistics.mean(latencies_ms)
    min_latency = min(latencies_ms)
    max_latency = max(latencies_ms)
    assert all(code == 200 for code in status_codes), f"Non-200 status codes observed: {status_codes}"
    assert avg_latency < MAX_LATENCY_MS, f"Average latency {avg_latency:.2f} ms exceeded {MAX_LATENCY_MS} ms"

    nft2_metric = f"Avg={avg_latency:.2f} ms (Min={min_latency:.2f} ms, HTTP 200 OK)"
    log_step("NFT-02", "Endpoint Response Time / Latency Benchmark", "PASS", nft2_metric, f"< {MAX_LATENCY_MS:.0f} ms")
    summary_rows.append(("NFT-02", "Endpoint Latency Benchmark", nft2_metric, f"< {MAX_LATENCY_MS:.0f} ms", "PASS"))

    # -------------------------------------------------------------------------
    # NFT-03: Security & Secret Key Exposure Check
    # -------------------------------------------------------------------------
    scanned_files = 0
    exposed_secrets = []

    scan_targets = list(SRC_DIR.rglob("*.*")) + list(DIST_DIR.rglob("*.*"))
    for file_path in scan_targets:
        if file_path.suffix.lower() in {".ts", ".tsx", ".js", ".jsx", ".html", ".css", ".json"}:
            scanned_files += 1
            content = file_path.read_text(encoding="utf-8", errors="ignore")
            for pattern in FORBIDDEN_PATTERNS:
                if re.search(pattern, content):
                    exposed_secrets.append((str(file_path.relative_to(WORKSPACE_ROOT)), pattern))

    assert len(exposed_secrets) == 0, f"Exposed secrets detected: {exposed_secrets}"

    nft3_metric = f"0 leaks across {scanned_files} client/bundle files"
    log_step("NFT-03", "Security & Secret Key Exposure Audit", "PASS", nft3_metric, "0 Secret Keys Exposed")
    summary_rows.append(("NFT-03", "Security & Key Audit", nft3_metric, "0 Leaks", "PASS"))

    # Summary Table
    print("\n" + "-" * 94)
    print(f"  {'TEST ID':<8} | {'NON-FUNCTIONAL METRIC':<26} | {'MEASURED VALUE':<36} | {'THRESHOLD':<10} | {'STATUS':<6}")
    print("-" * 94)
    for tid, name, val, thresh, st in summary_rows:
        print(f"  {tid:<8} | {name:<26} | {val:<36} | {thresh:<10} | [{st}]")
    print("-" * 94)
    print("  RESULT: 3/3 NON-FUNCTIONAL BENCHMARKS PASSED (100% COMPLIANT)")
    print("=" * 94)


if __name__ == "__main__":
    run_non_functional_tests()
