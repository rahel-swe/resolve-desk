using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResolveDesk.Api.Common;
using ResolveDesk.Application.Dtos;
using ResolveDesk.Application.Services;

namespace ResolveDesk.Api.Controllers;

[Authorize(Policy = "AdminOrUser")]
[ApiController]
[Route("api/users")]
public class UserController(IUserService userService) : ControllerBase
{
    private readonly IUserService _userService = userService;

    [HttpGet("me")]
    public async Task<ActionResult<ServiceResult<GetCurrentUserResponseDto>>> GetCurrentUser(CancellationToken cancellationToken)
    {
        if (!User.TryGetCurrentUser(out var caller))
            return Unauthorized();

        var result = await _userService.GetCurrentUser(caller, cancellationToken);

        return Ok(result);
    }
}
