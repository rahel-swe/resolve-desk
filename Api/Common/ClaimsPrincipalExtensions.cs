using System.Security.Claims;
using ResolveDesk.Domain.Enums;

namespace ResolveDesk.Application.Common;

public static class ClaimsPrincipalExtentions
{
    public static bool TryGetCurrentUser(this ClaimsPrincipal principal, out CurrentUser currentUser)
    {
        currentUser = default!;

        var idValue = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        var email = principal.FindFirstValue(ClaimTypes.Email);
        var roleValue = principal.FindFirstValue(ClaimTypes.Role);

        if (!int.TryParse(idValue, out var id) || string.IsNullOrWhiteSpace(roleValue))
            return false;

        if (string.IsNullOrWhiteSpace(roleValue) || !Enum.TryParse<UserRole>(roleValue, out var role))
        {
            currentUser = default!;
            return false;
        }

        currentUser = new CurrentUser(id, email, role);

        return true;
    }
}
