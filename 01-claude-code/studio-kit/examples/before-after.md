# Before and after — hypothetical response comparisons

These are **illustrative, not observed model sessions**. They show checks that the public instructions *ask* an agent to consider, not what any model reliably does. No controlled performance experiment is claimed.

## 1. Multi-user SaaS with accounts

**Request:** “Build me a SaaS app with user accounts.”

**Illustrative incomplete response (not observed):** Creates login screens and CRUD operations with a happy-path test; its response does **not demonstrate** server-side authorization per record or a cross-user negative test.

**Illustrative kit-guided response (desired, not observed):** In addition to requested behavior, inspect the server-side data path for record ownership and authorization; test that user A cannot read or modify user B’s records; report the check and its actual result. Avoid adding needless enterprise architecture.

**Why this matters:** Authentication proves identity; it does not by itself prove authorization for every record.

## 2. Appointment form

**Request:** “Add a form that saves the appointment.”

**Illustrative incomplete response (not observed):** Provides fields and a submit handler but does not demonstrate server-side validation, an invalid-request test or ownership association where user accounts exist.

**Illustrative kit-guided response (desired, not observed):** Check validation and rejection of malformed input, preserve normal successful saves, verify correct ownership where applicable and keep changes limited to the form and save path.

## 3. Maintenance fix

**Request:** “Fix this bug without breaking the rest.”

**Illustrative incomplete response (not observed):** Patches a likely cause but gives no verifiable account of regression tests.

**Illustrative kit-guided response (desired, not observed):** Identify existing behavior first; use focused positive and negative/failure controls; make the smallest coherent patch; state what was `PASS`, `FAIL`, `NOT_RUN` or `UNKNOWN` based on actual execution.

These comparisons are teaching illustrations derived from the public `AGENTS.md` and `PRACTICES.md`. They do **not** measure the effect of installing this kit. For a separately documented **single-project local repair**, read `verification-examples.md`.
