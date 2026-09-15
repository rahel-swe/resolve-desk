using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResolveDesk.Dtos;
using ResolveDesk.Models;
using ResolveDesk.Services;

namespace ResolveDesk.Controllers;

[Authorize]
[ApiController]
[Route("api/tickets")]
public class TicketCommentController(ITicketCommentService ticketCommentService) : ControllerBase
{
    private readonly ITicketCommentService _ticketCommentService = ticketCommentService;


    [HttpPost("{id}/comments")]
    public async Task<ActionResult> CreateTicketComment(int id, CreateTicketCommentDto request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId is null) return Unauthorized();

        await _ticketCommentService.AddTicketCommentAsync(int.Parse(userId), id, request);

        return Ok();
    }

    [HttpGet("{id}/comments")]
    public async Task<ActionResult<List<TicketCommentResponseDto>>> GetTicketCommentsById(int id)
    {
        var result = await _ticketCommentService.GetTicketCommentsAsync(id);

        return Ok(result);
    }

}
