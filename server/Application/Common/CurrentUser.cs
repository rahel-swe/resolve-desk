using ResolveDesk.Domain.Enums;

namespace ResolveDesk.Application.Common;

public sealed record CurrentUser(int Id, string? Email, UserRole Role)
{
    public bool IsAdmin => Role == UserRole.Admin;
    public bool IsStaff => Role == UserRole.Staff;
    public bool IsCustomer => Role == UserRole.Customer;
}
