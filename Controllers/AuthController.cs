using ContosoPizza.Dtos;
using ContosoPizza.Services;
using Microsoft.AspNetCore.Mvc;

namespace ContosoPizza.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService, IUserService userService) : ControllerBase
{
    private readonly IAuthService _authService = authService;
    private readonly IUserService _userService = userService;

    [HttpPost("login")]
    public async Task<ActionResult<TokenResponseDto>> Login(LoginDto request)
    {
        var result = await _authService.LoginAsync(request);

        if (result is null) return Unauthorized();

        return Ok(result);
    }

    [HttpPost("register")]
    public async Task<ActionResult<TokenResponseDto>> Register(RegisterDto request)
    {
        var result = await _userService.RegisterUserAsync(request);

        return Ok(result);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<TokenResponseDto>> Refresh(RefreshTokenRequestDto request)
    {
        var result = await _authService.RefreshTokenAsync(request);

        if (result is null) return Unauthorized();

        return Ok(result);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(RefreshTokenRequestDto request)
    {
        var revoked = await _authService.LogoutAsync(request);

        if (!revoked) return NoContent();

        return NoContent();
    }
}
