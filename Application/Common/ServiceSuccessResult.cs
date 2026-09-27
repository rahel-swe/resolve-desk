namespace ResolveDesk.Application.Common;

public class ServiceResult<T>(T? data, string? message = null)
{
    public T? Data { get; set; } = data;
    public bool IsSuccess { get; set; } = true;
    public string? Message { get; set; } = message ?? "Data fetched successfully.";
}
