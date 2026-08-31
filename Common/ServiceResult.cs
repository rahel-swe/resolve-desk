namespace ContosoPizza.Common;

public class ServiceResult<T>
{
    public ServiceResultStatus Status { get; set; }
    public bool IsSuccess => Status == ServiceResultStatus.Success;

    public string? ErrorMessage { get; set; }

    public T? Data { get; set; }

    public static ServiceResult<T> Success(T data)
    {
        return new ServiceResult<T>
        {
            Status = ServiceResultStatus.Success,
            Data = data
        };
    }

    public static ServiceResult<T> BadRequest(string errorMessage)
    {
        return new ServiceResult<T>
        {
            Status = ServiceResultStatus.BadRequest,
            ErrorMessage = errorMessage
        };
    }

    public static ServiceResult<T> NotFound(string errorMessage)
    {
        return new ServiceResult<T>
        {
            Status = ServiceResultStatus.NotFound,
            ErrorMessage = errorMessage
        };
    }

    public static ServiceResult<T> Conflict(string errorMessage)
    {
        return new ServiceResult<T>
        {
            Status = ServiceResultStatus.Conflict,
            ErrorMessage = errorMessage
        };
    }
}