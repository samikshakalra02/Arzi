import urllib.request
import json
import re

def verify_all():
    print(">> 1. Verifying index.html (both static and root)...")
    for path in ['flask_backend/static/index.html', 'index.html']:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        assert 'Successfully registered!' in content, f"Missing 'Successfully registered!' in {path}"
        assert 'सफलतापूर्वक पंजीकृत!' in content, f"Missing 'सफलतापूर्वक पंजीकृत!' in {path}"
        assert 'goToAuditRunLogForCase()' in content, f"Missing goToAuditRunLogForCase() in {path}"
        assert 'View in Audit Run Log' in content, f"Missing 'View in Audit Run Log' button in {path}"
        assert 'Register Case &amp; Route PIO →' in content, f"Missing 'Register Case & Route PIO →' in {path}"
        print(f"   [PASS] {path} verified.")

    print("\n>> 2. Verifying app.js (both static and root)...")
    for path in ['flask_backend/static/app.js', 'app.js']:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        assert 'Successfully registered!' in content, f"Missing 'Successfully registered!' in {path}"
        assert 'goToAuditRunLogForCase' in content, f"Missing goToAuditRunLogForCase in {path}"
        assert '"CASE_REGISTERED": "केस पंजीकृत"' in content, f"Missing CASE_REGISTERED translation in {path}"
        assert 'CASE_REGISTERED' in content, f"Missing CASE_REGISTERED in {path}"
        assert 'tabId === "runlog"' in content, f"Missing runlog tab switcher in {path}"
        print(f"   [PASS] {path} verified.")

    print("\n>> 3. Verifying Live Flask API at http://127.0.0.1:5000...")
    health_req = urllib.request.urlopen("http://127.0.0.1:5000/health")
    health_data = json.loads(health_req.read().decode())
    assert health_data["status"] == "online", f"Health status not online: {health_data}"
    print("   [PASS] Server is online.")

    # Ingest a test case
    payload = {
        "complainant": {
            "name": "Pooja Verma",
            "contact": "+91-9812345678",
            "address": "Civil Lines, Delhi",
            "pincode": "110054",
            "language": "Hindi"
        },
        "raw_grievance": "BPL ration card grievance (Ref DEL-RAT-992) pending at supply office.",
        "application_ref_no": "DEL-RAT-992",
        "original_submission_date": "2026-03-01",
        "department": "Food & Civil Supplies"
    }

    req = urllib.request.Request(
        "http://127.0.0.1:5000/api/v1/cases/intake",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    assert res.status == 201, f"Intake failed with status {res.status}"
    case_data = json.loads(res.read().decode())["case"]
    case_id = case_data["case_id"]
    print(f"   [PASS] Case registered successfully: {case_id}")

    # Verify run log contains the registered case
    run_log_req = urllib.request.urlopen("http://127.0.0.1:5000/api/v1/run-log")
    run_log_data = json.loads(run_log_req.read().decode())
    logs = run_log_data["run_logs"]
    matching_log = next((l for l in logs if l["case_id"] == case_id), None)
    assert matching_log is not None, f"Audit Run Log does not contain case {case_id}"
    assert matching_log["event_type"] == "CASE_REGISTERED", f"Unexpected event_type: {matching_log['event_type']}"
    assert "Successfully registered case" in matching_log["action"], f"Unexpected action: {matching_log['action']}"
    assert matching_log["result"] == "SUCCESS", f"Unexpected result: {matching_log['result']}"
    print(f"   [PASS] Audit Run Log successfully updated with record:")
    print(f"          - Run ID: {matching_log['run_id']}")
    print(f"          - Case ID: {matching_log['case_id']}")
    print(f"          - Event Type: {matching_log['event_type']}")
    print(f"          - Action: {matching_log['action']}")
    print(f"          - Timestamp: {matching_log['timestamp']}")
    print("\n>> ALL VERIFICATION CHECKS PASSED PERFECTLY!")

if __name__ == "__main__":
    verify_all()
