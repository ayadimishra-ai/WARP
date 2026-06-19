"""esg_store — ESG data pool. GHG data stays in inventory.sqlite."""
from esg_store.db import (
    get_db, load_disclosure_points, seed_document_register,
    upsert_datapoint, get_datapoints, get_total, get_coverage_summary,
    register_document, get_documents, add_kernel, promote_kernel_to_datapoint,
    upsert_narrative, get_narrative, get_dp, get_dps_for_framework, get_dps_for_module,
)
