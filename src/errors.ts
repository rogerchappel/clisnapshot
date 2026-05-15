export class CliSnapshotError extends Error {
  constructor(message: string, readonly code = "CLISNAPSHOT_ERROR") {
    super(message);
    this.name = "CliSnapshotError";
  }
}
