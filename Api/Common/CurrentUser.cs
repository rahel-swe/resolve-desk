namespace ResolveDesk.Application.Common;

public sealed record CurrentUser(int Id, string? Email, string Role)
{
    public bool IsAdmin => Role == "Admin";
    public bool IsSupportAgent => Role == "SupportAgent";
    public bool IsCustomer => Role == "Customer" || Role == "User";
}
