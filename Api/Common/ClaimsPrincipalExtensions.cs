using System.Security.Claims;

namespace ResolveDesk.Common;

public static class ClaimsPrincipalExtentions
{
    public static bool TryGetCurrentUser(this ClaimsPrincipal principal, out CurrentUser currentUser)
    {
        currentUser = default!;

        var idValue = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var email = principal.FindFirst(ClaimTypes.Email)?.Value;
        var role = principal.FindFirst(ClaimTypes.Role)?.Value;

        if (!int.TryParse(idValue, out var id) || string.IsNullOrWhiteSpace(role))
            return false;

        currentUser = new CurrentUser(id, email, role);

        return true;
    }
}
