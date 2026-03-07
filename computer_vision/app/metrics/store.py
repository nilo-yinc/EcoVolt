# app/metrics/store.py

"""
Shared metrics store accessible by API and CV pipeline.
"""

metrics_data = {
    "precision": 0,
    "recall": 0,
    "f1": 0,
    "false_trigger_rate": 0,
    "latency": 0
}


def update_metrics(new_metrics):
    metrics_data.update(new_metrics)


def get_metrics():
    return metrics_data