using ContosoPizza.Dtos;
using ContosoPizza.Services;
using Microsoft.AspNetCore.Mvc;

namespace ContosoPizza.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    private readonly IAuthService _authService = authService;

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
        var result = await _authService.RegisterAsync(request);

        return Ok(result);
    }
}
