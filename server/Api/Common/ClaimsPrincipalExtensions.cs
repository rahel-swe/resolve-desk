using System.Security.Claims;
using ResolveDesk.Application.Common;
using ResolveDesk.Domain.Enums;

namespace ResolveDesk.Api.Common;

public static class ClaimsPrincipalExtentions
{
    public static bool TryGetCurrentUser(this ClaimsPrincipal principal, out CurrentUser currentUser)
    {
        currentUser = default!;

        var idValue = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        var email = principal.FindFirstValue(ClaimTypes.Email);
        var roleValue = principal.FindFirstValue(ClaimTypes.Role);

        if (!int.TryParse(idValue, out var id) || id <= 0 || string.IsNullOrWhiteSpace(roleValue))
            return false;

        if (!Enum.TryParse<UserRole>(roleValue, out var role) || !Enum.IsDefined(role))
        {
            currentUser = default!;
            return false;
        }

        currentUser = new CurrentUser(id, email, role);

        return true;
    }
}
