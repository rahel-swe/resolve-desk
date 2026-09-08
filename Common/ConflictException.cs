namespace InsightDesk.Common;

public sealed class ConflictException(string message) : Exception(message);