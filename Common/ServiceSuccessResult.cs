namespace SupportPilotAI.Common;

public class ServiceResult<T>(T? data, string? message = null)
{
    public T? Data { get; set; } = data;
    public string? Message { get; set; } = message ?? "Data fetched successfully.";
}