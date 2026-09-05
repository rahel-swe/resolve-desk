namespace ContosoPizza.Common;

public sealed class ConflictException(string message) : Exception(message);