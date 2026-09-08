namespace SupportPilotAi.Common;

public sealed class NotFoundException(string message) : Exception(message);