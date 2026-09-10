namespace SupportPilotAI.Common;

public class ServiceResult<T>(T? data, string? successMessage = null)
{
    public T? Data { get; set; } = data;
    public string? SuccessMessage { get; set; } = successMessage ?? "Data fetched successfully.";
}