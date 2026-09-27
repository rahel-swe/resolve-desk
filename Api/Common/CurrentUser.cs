using ResolveDesk.Domain.Enums;

namespace ResolveDesk.Application.Common;

public sealed record CurrentUser(int Id, string? Email, UserRole Role)
{
    public bool IsAdmin => Role == UserRole.Admin;
    public bool IsSupportAgent => Role == UserRole.SupportAgent;
    public bool IsCustomer => Role == UserRole.Customer || Role == UserRole.User;
}
