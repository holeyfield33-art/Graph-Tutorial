# Curated practices (select only what applies)

These are high-leverage items drawn from existing Studio guidance. Use only those relevant to the product type and risk. Record a brief reason for inclusion or omission.

| Practice | When relevant | When to omit or scale down |
|----------|---------------|----------------------------|
| Server-side authorization & ownership checks | Multi-user, SaaS, any shared data | Single-user local tool with no shared state |
| Negative / failure-path tests | Any non-trivial mutation or boundary | Purely static content with no logic |
| Tenant or data isolation | Multi-tenant SaaS or shared database | Single-tenant or fully local |
| Requirements clarification (auth vs authz, success criteria) | Ambiguous user request involving access or data | Crystal-clear single-user utility |
| Proportional verification | Any change that can break existing behavior | Trivial one-line comment |
| Error handling & user-visible feedback | User-facing flows that can fail | Internal one-off scripts |
| Migration / backward-compatibility note | Changing stored data shape or public interface | Greenfield with no existing users |
| Dependency & lockfile hygiene | Adding or updating packages | No dependency changes |

Do not apply every row. The goal is better decisions at the moment of need, not coverage of every possible stage.
