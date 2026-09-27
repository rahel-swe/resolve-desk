using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResolveDesk.Api.Common;
using ResolveDesk.Application.Dtos;
using ResolveDesk.Application.Services;

namespace ResolveDesk.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/tickets")]
public class TicketCommentController(ITicketCommentService ticketCommentService) : ControllerBase
{
    private readonly ITicketCommentService _ticketCommentService = ticketCommentService;


    [HttpPost("{id}/comments")]
    public async Task<ActionResult> CreateTicketComment(int id, CreateTicketCommentDto request, CancellationToken cancellationToken)
    {
        if (!User.TryGetCurrentUser(out var caller))
            return Unauthorized();

        await _ticketCommentService.AddTicketCommentAsync(caller.Id, id, request, caller, cancellationToken);

        return Ok();
    }

    [HttpGet("{id}/comments")]
    public async Task<ActionResult<List<TicketCommentResponseDto>>> GetTicketCommentsById(int id, CancellationToken cancellationToken)
    {
        if (!User.TryGetCurrentUser(out var caller))
            return Unauthorized();

        var result = await _ticketCommentService.GetTicketCommentsAsync(id, caller, cancellationToken);

        return Ok(result);
    }
    [HttpGet("{id}/comments/{commentId}")]
    public async Task<ActionResult<TicketCommentResponseDto>> GetTicketCommentsById(int id, int commentId, CancellationToken cancellationToken)
    {
        if (!User.TryGetCurrentUser(out var caller))
            return Unauthorized();

        var result = await _ticketCommentService.GetCommentByIdAsync(id, commentId, caller, cancellationToken);

        return Ok(result);
    }

}
