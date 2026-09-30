import sys
import json
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.app.database.connection import SessionLocal
from backend.app.services.evaluation_service import run_evaluation_suite

ROOT_DIR = Path(__file__).resolve().parent.parent
EVAL_RESULTS_PATH = ROOT_DIR / "data" / "evaluation_results.json"


def main():
    print("=" * 60)
    print("HOSPITAL PHARMACY SUBSTITUTION DECISION SUPPORT SYSTEM")
    print("BASELINE EVALUATION BENCHMARK SUITE")
    print("=" * 60)

    db = SessionLocal()
    try:
        results = run_evaluation_suite(db=db, persist_decisions=True)

        # Output to data/evaluation_results.json
        output_metrics = {
            "total_cases": results["total_cases"],
            "correct_decisions": results["correct_decisions"],
            "incorrect_decisions": results["incorrect_decisions"],
            "accuracy": results["accuracy"],
            "approved": results["approved"],
            "blocked": results["blocked"],
            "escalated": results["escalated"],
            "review_required": results["review_required"],
            "human_review_count": results["human_review_count"],
            "false_positive_escalation_rate": results["false_positive_escalation_rate"],
            "false_negative_approval_rate": results["false_negative_approval_rate"]
        }

        EVAL_RESULTS_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(EVAL_RESULTS_PATH, "w", encoding="utf-8") as f:
            json.dump(output_metrics, f, indent=2)

        print(f"\nEvaluation successfully saved to: {EVAL_RESULTS_PATH}")
        print("\n--- MEASURED RESULTS ---")
        for key, value in output_metrics.items():
            print(f"  {key:<32}: {value}")

        print("\n--- TEST CASE BREAKDOWN ---")
        for case in results["case_results"]:
            status = "PASS" if case["is_correct"] else "FAIL"
            print(f"  [{status}] {case['test_id']}: {case['name']} -> {case['actual_decision']} (Expected: {case['expected_decision']})")

        print("=" * 60)
        return output_metrics
    finally:
        db.close()


if __name__ == "__main__":
    main()
