# Examples

## Capture help output

```json
{
  "cases": {
    "help-output": {
      "command": "node",
      "args": ["fixtures/bin/example-cli.mjs", "--help"]
    }
  }
}
```

```sh
clisnapshot run --update --case help-output
clisnapshot run --case help-output
```

## Capture a failing command

Non-zero exits are captured in the snapshot record, which is useful for documenting error UX.

```json
{
  "cases": {
    "bad-input": {
      "command": "node",
      "args": ["fixtures/bin/example-cli.mjs", "fail"]
    }
  }
}
```
