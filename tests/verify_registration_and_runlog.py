import urllib.request
import json
import re
import time

def verify_all():
    print(">> 1. Verifying index.html (both static and root)...")
    expected_models = [
        "Claude Sonnet Model 4.6",
        "GPT-OSS 1208",
        "Gemini 3.8 Flash",
        "3.7 Flash"
    ]
    for path in ['flask_backend/static/index.html', 'index.html']:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        assert 'Successfully registered!' in content, f"Missing 'Successfully registered!' in {path}"
        assert 'सफलतापूर्वक पंजीकृत!' in content, f"Missing 'सफलतापूर्वक पंजीकृत!' in {path}"
        assert 'goToAuditRunLogForCase()' in content, f"Missing goToAuditRunLogForCase() in {path}"
        assert 'View in Audit Run Log' in content, f"Missing 'View in Audit Run Log' button in {path}"
        assert 'Register Case &amp; Route PIO →' in content, f"Missing 'Register Case & Route PIO →' in {path}"
        
        # Verify AI model choices in HTML
        for model in expected_models:
            assert model in content, f"Missing model '{model}' in {path}"
        assert 'id="studioAiModelSelect"' in content, f"Missing #studioAiModelSelect in {path}"
        assert 'id="caseworkAiModelSelect"' in content, f"Missing #caseworkAiModelSelect in {path}"
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
        
        # Verify AI model functions in JS
        assert 'AI_DRAFTING_MODELS' in content, f"Missing AI_DRAFTING_MODELS in {path}"
        assert 'setDraftingAiModel' in content, f"Missing setDraftingAiModel in {path}"
        assert 'regenerateActiveDocumentWithModel' in content, f"Missing regenerateActiveDocumentWithModel in {path}"
        for model in expected_models:
            assert model in content, f"Missing model '{model}' in {path}"
        print(f"   [PASS] {path} verified.")

    print("\n>> 3. Verifying Live Flask API at http://127.0.0.1:5000...")
    health_req = urllib.request.urlopen("http://127.0.0.1:5000/health")
    health_data = json.loads(health_req.read().decode())
    assert health_data["status"] == "online", f"Health status not online: {health_data}"
    print("   [PASS] Server is online.")

    # Ingest a test case with unique timestamp to verify registration and run log
    uid = int(time.time() * 1000)
    payload = {
        "complainant": {
            "name": f"Citizen {uid}",
            "contact": "+91-9812345678",
            "address": "Civil Lines, Delhi",
            "pincode": "110054",
            "language": "Hindi"
        },
        "raw_grievance": f"BPL ration card grievance (Ref DEL-RAT-{uid}) pending at supply office.",
        "application_ref_no": f"DEL-RAT-{uid}",
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
    matching_log = next((l for l in logs if l["case_id"] == case_id and l["event_type"] == "CASE_REGISTERED"), None)
    assert matching_log is not None, f"Audit Run Log does not contain CASE_REGISTERED for case {case_id}"
    assert matching_log["event_type"] == "CASE_REGISTERED", f"Unexpected event_type: {matching_log['event_type']}"
    assert "Successfully registered case" in matching_log["action"], f"Unexpected action: {matching_log['action']}"
    assert matching_log["result"] == "SUCCESS", f"Unexpected result: {matching_log['result']}"
    print(f"   [PASS] Audit Run Log successfully updated with record:")
    print(f"          - Run ID: {matching_log['run_id']}")
    print(f"          - Case ID: {matching_log['case_id']}")
    print(f"          - Event Type: {matching_log['event_type']}")
    print(f"          - Action: {matching_log['action']}")
    print(f"          - Timestamp: {matching_log['timestamp']}")

    print("\n>> 4. Verifying Document Generation with 4 AI Model Choices on Live Server...")
    for model in expected_models:
        for doc_type in ["Form", "Appeal", "Notice"]:
            gen_payload = {
                "document_type": doc_type,
                "language": "en",
                "model": model,
                "data": {
                    "name": f"Citizen {uid}",
                    "department": "Food & Civil Supplies",
                    "subject": f"Statutory Demand for {doc_type}",
                    "questions": "1. Provide certified copy of roster."
                }
            }
            g_req = urllib.request.Request(
                "http://127.0.0.1:5000/api/v1/cases/generate-doc",
                data=json.dumps(gen_payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            g_res = urllib.request.urlopen(g_req)
            assert g_res.status == 200, f"Failed generating {doc_type} with {model}"
            g_data = json.loads(g_res.read().decode())
            assert g_data["model"] == model, f"Model mismatch: expected {model}, got {g_data['model']}"
            assert f"[DRAFTED & VERIFIED VIA AI ENGINE: {model} | ARZI STATUTORY DRAFTING SUITE]" in g_data["document"]
            print(f"   [PASS] Generated {doc_type} successfully with: {model}")

    print("\n>> ALL VERIFICATION CHECKS (REGISTRATION, AUDIT RUN LOG, & AI MODELS) PASSED PERFECTLY!")

if __name__ == "__main__":
    verify_all()
