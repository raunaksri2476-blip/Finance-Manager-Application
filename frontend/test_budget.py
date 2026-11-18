import sys
import time
import urllib.request
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

TARGET_URL = "http://localhost:3000/"


def log_step(test_id: str, title: str, status: str, duration_ms: float, details: str = ""):
    ts = datetime.now().strftime("%H:%M:%S.%f")[:-3]
    tag = f"[{status}]"
    detail_str = f" | {details}" if details else ""
    print(f"[{ts}] {tag:6} {test_id}: {title} ({duration_ms:.1f} ms){detail_str}")


def run_functional_tests():
    print("=" * 90)
    print("  MYBUDGET / FINANCE MANAGER - AUTOMATED SELENIUM FUNCTIONAL TEST SUITE")
    print(f"  Target Endpoint : {TARGET_URL}")
    print(f"  Execution Time  : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 90)

    # Pre-check HTTP 200 OK
    req = urllib.request.Request(TARGET_URL, method="GET")
    with urllib.request.urlopen(req, timeout=5) as resp:
        assert resp.status == 200, f"Expected HTTP 200 OK, got {resp.status}"

    options = webdriver.ChromeOptions()
    if "--headed" not in sys.argv:
        options.add_argument("--headless=new")
    options.add_argument("--window-size=1440,900")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--log-level=3")
    options.add_experimental_option("excludeSwitches", ["enable-logging"])

    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 15)
    results = []

    try:
        # -------------------------------------------------------------------------
        # FT-01: Page Load & DOM Title Check
        # -------------------------------------------------------------------------
        t0 = time.perf_counter()
        driver.get(TARGET_URL)
        wait.until(lambda d: d.execute_script("return document.readyState") == "complete")
        page_title = driver.title
        assert "Finance Manager" in page_title or "MyBudget" in page_title, (
            f"Unexpected title: {page_title}"
        )
        dur1 = (time.perf_counter() - t0) * 1000
        safe_title = page_title.encode("ascii", "ignore").decode("ascii").strip()
        log_step("FT-01", "Page Load & DOM Title Check", "PASS", dur1, f'Title="{safe_title}"')
        results.append(("FT-01", "Page Load & DOM Title Check", f"{dur1:.1f} ms", "PASS"))

        # -------------------------------------------------------------------------
        # FT-02: Initial Wallet Balance & Ledger Render
        # -------------------------------------------------------------------------
        t0 = time.perf_counter()
        time.sleep(0.8)
        if "/login" in driver.current_url:
            guest_btn = wait.until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//button[contains(., 'Guest') or contains(., 'Demo')]")
                )
            )
            guest_btn.click()

        # Dismiss onboarding if shown
        time.sleep(0.8)
        skip_btns = driver.find_elements(
            By.XPATH,
            "//button[contains(., 'Skip') or contains(., 'Get Started') or contains(., 'Go to Dashboard')]",
        )
        if skip_btns:
            skip_btns[0].click()
            time.sleep(0.5)

        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), '₹')]")))
        page_text = driver.page_source
        assert "₹" in page_text, "Currency symbol not found in initial wallet render"
        dur2 = (time.perf_counter() - t0) * 1000
        log_step(
            "FT-02",
            "Initial Wallet Balance & Ledger Render",
            "PASS",
            dur2,
            "Dashboard wallet & initial ledger verified",
        )
        results.append(("FT-02", "Initial Wallet Balance & Ledger Render", f"{dur2:.1f} ms", "PASS"))

        # -------------------------------------------------------------------------
        # FT-03: Modal Interaction (Open Add Expense form)
        # -------------------------------------------------------------------------
        t0 = time.perf_counter()
        add_btn = wait.until(
            EC.element_to_be_clickable(
                (
                    By.XPATH,
                    "//button[contains(., 'Add Transaction') or contains(., '+') or contains(@onclick, 'toggleAddModal')]",
                )
            )
        )
        add_btn.click()
        title_input = wait.until(EC.visibility_of_element_located((By.ID, "tx-title")))
        dur3 = (time.perf_counter() - t0) * 1000
        log_step(
            "FT-03",
            "Modal Interaction (Open Add Expense form)",
            "PASS",
            dur3,
            "Add Transaction modal active",
        )
        results.append(("FT-03", "Modal Interaction (Open Add Expense form)", f"{dur3:.1f} ms", "PASS"))

        # -------------------------------------------------------------------------
        # FT-04: Form Input & Validation (Title, Category, Amount)
        # -------------------------------------------------------------------------
        t0 = time.perf_counter()
        amount_input = wait.until(EC.visibility_of_element_located((By.ID, "tx-amount")))

        tx_title_val = "Automated Selenium Test"
        tx_amount_val = "1550.00"
        tx_cat_val = "Food"

        title_input.clear()
        title_input.send_keys(tx_title_val)

        amount_input.clear()
        amount_input.send_keys(tx_amount_val)

        cat_elements = driver.find_elements(By.ID, "tx-category")
        if cat_elements:
            Select(cat_elements[0]).select_by_visible_text(tx_cat_val)

        assert title_input.get_attribute("value") == tx_title_val, "Title input mismatch"
        assert float(amount_input.get_attribute("value")) == 1550.0, "Amount input mismatch"
        dur4 = (time.perf_counter() - t0) * 1000
        log_step(
            "FT-04",
            "Form Input & Validation (Title, Category, Amount)",
            "PASS",
            dur4,
            f'Title="{tx_title_val}", Category="{tx_cat_val}", Amount=INR {tx_amount_val}',
        )
        results.append(
            ("FT-04", "Form Input & Validation (Title, Category, Amount)", f"{dur4:.1f} ms", "PASS")
        )

        # -------------------------------------------------------------------------
        # FT-05: Submission & Ledger DOM Assertion
        # -------------------------------------------------------------------------
        t0 = time.perf_counter()
        submit_btn = driver.find_element(
            By.XPATH,
            "//form//button[@type='submit' or contains(., 'Add Transaction') or contains(., 'Save')]",
        )
        submit_btn.click()

        wait.until(
            EC.presence_of_element_located(
                (By.XPATH, f"//*[contains(text(), '{tx_title_val}')]")
            )
        )
        assert tx_title_val in driver.page_source, "Submitted transaction not found in DOM ledger"
        dur5 = (time.perf_counter() - t0) * 1000
        log_step(
            "FT-05",
            "Submission & Ledger DOM Assertion",
            "PASS",
            dur5,
            f'Verified "{tx_title_val}" in live DOM ledger',
        )
        results.append(("FT-05", "Submission & Ledger DOM Assertion", f"{dur5:.1f} ms", "PASS"))

        # Summary Table
        print("\n" + "-" * 90)
        print(f"  {'TEST ID':<10} | {'SCENARIO DESCRIPTION':<48} | {'DURATION':<12} | {'STATUS':<8}")
        print("-" * 90)
        for tid, desc, dur, st in results:
            print(f"  {tid:<10} | {desc:<48} | {dur:<12} | [{st}]")
        print("-" * 90)
        print("  RESULT: 5/5 FUNCTIONAL TESTS PASSED (100% SUCCESS)")
        print("=" * 90)

    finally:
        driver.quit()


if __name__ == "__main__":
    run_functional_tests()
