using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResolveDesk.Common;
using ResolveDesk.Dtos;
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
        if (!User.TryGetCurrentUser(out var caller))
            return Unauthorized();

        await _ticketCommentService.AddTicketCommentAsync(caller.Id, id, request, caller);

        return Ok();
    }

    [HttpGet("{id}/comments")]
    public async Task<ActionResult<List<TicketCommentResponseDto>>> GetTicketCommentsById(int id)
    {
        if (!User.TryGetCurrentUser(out var caller))
            return Unauthorized();

        var result = await _ticketCommentService.GetTicketCommentsAsync(id, caller);

        return Ok(result);
    }
    [HttpGet("{id}/comments/{commentId}")]
    public async Task<ActionResult<TicketCommentResponseDto>> GetTicketCommentsById(int id, int commentId)
    {
        if (!User.TryGetCurrentUser(out var caller))
            return Unauthorized();

        var result = await _ticketCommentService.GetCommentByIdAsync(id, commentId, caller);

        return Ok(result);
    }

}
