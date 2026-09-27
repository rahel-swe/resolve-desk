namespace ResolveDesk.Api.Common;

public sealed class ConflictException(string message) : Exception(message);
