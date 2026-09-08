namespace SupportPilotAI.Common;

public sealed class NotFoundException(string message) : Exception(message);