using ResolveDesk.Application.Dtos;
using ResolveDesk.Application.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ResolveDesk.Api.Common;

namespace ResolveDesk.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService, IUserService userService) : ControllerBase
{
    private readonly IAuthService _authService = authService;
    private readonly IUserService _userService = userService;

    [HttpPost("login")]
    public async Task<ActionResult<ServiceResult<TokenResponseDto>>> Login(LoginDto request)
    {
        var result = await _authService.LoginAsync(request);

        if (result is null) return Unauthorized();


        return Ok(new ServiceResult<TokenResponseDto>(result, "Signed in successfully."));
    }

    [HttpPost("register")]
    public async Task<ActionResult<ServiceResult<TokenResponseDto>>> Register(RegisterDto request)
    {
        var result = await _userService.RegisterUserAsync(request);

        return Ok(new ServiceResult<TokenResponseDto>(result, "Account created successfully."));
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<ServiceResult<TokenResponseDto>>> Refresh(RefreshTokenRequestDto request)
    {
        var result = await _authService.RefreshTokenAsync(request);

        if (result is null) return Unauthorized();

        return Ok(new ServiceResult<TokenResponseDto>(result, "Token refreshed successfully."));
    }

    [Authorize]
    [HttpGet("me")]
    public ActionResult<ServiceResult<object>> Me()
    {
        if (!User.TryGetCurrentUser(out var currentUser)) return Unauthorized();

        return Ok(new ServiceResult<object>(
            new { userId = currentUser.Id.ToString(), email = currentUser.Email, role = currentUser.Role.ToString() },
            "Current user fetched successfully."));
    }

    [HttpPost("logout")]
    public async Task<ActionResult<ServiceResult<object?>>> Logout(RefreshTokenRequestDto request)
    {
        await _authService.LogoutAsync(request);

        return Ok(new ServiceResult<object?>(null, "Signed out successfully."));
    }
}
