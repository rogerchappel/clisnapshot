# Roadmap

## Now

The local-first CLI snapshot MVP is implemented: named commands run from a
config, scrubbed output is compared or explicitly updated, and the repository
includes fixture-backed examples and tests. See the [README](README.md) for the
current user workflow.

## Next

- **Publish a config JSON Schema for editor validation.** Cover the fields
  accepted by `clisnapshot.config.json` (top-level directories, timeout,
  scrubbers, and named cases), document how to reference the schema from a
  config, and add a parity check so the schema and `validateConfig` do not
  silently diverge. Keep runtime validation authoritative for constraints that
  JSON Schema cannot express or that depend on runtime behavior.

## Later / needs user evidence

No additional feature is scheduled. Revisit watch mode, CI annotations, or
package-manager helpers only when users identify a concrete workflow these
would improve; they are not prerequisites for the current snapshot workflow.

## Not planned

- Hosted snapshot storage.
- Hidden telemetry.
- Mandatory accounts or cloud services.
