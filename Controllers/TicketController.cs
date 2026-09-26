using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResolveDesk.Common;
using ResolveDesk.Dtos;
using ResolveDesk.Enums;
using ResolveDesk.Services;

namespace ResolveDesk.Controllers;

[Authorize(Policy = "AdminOrUser")]
[ApiController]
[Route("api/tickets")]
public class TicketController(ITicketService ticketService, ITicketAIService ticketAIService) : ControllerBase
{
    private readonly ITicketService _ticketService = ticketService;
    private readonly ITicketAIService _ticketAIService = ticketAIService;

    [HttpGet]
    public async Task<ActionResult<PageResultDto<TicketResponseDto>>> GetAllTickets([FromQuery] TicketListQueryDto query, CancellationToken cancellationToken)

    {
        if (!User.TryGetCurrentUser(out var caller))
            return Unauthorized();



        var result = await _ticketService.GetAllTicketsAsync(query, caller, cancellationToken);

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TicketResponseDto>> GetTicketById(int id, CancellationToken cancellationToken)
    {

        if (!User.TryGetCurrentUser(out var caller))
            return Unauthorized();

        var result = await _ticketService.GetTicketByIdAsync(id, caller, cancellationToken);

        if (result.Data is null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<TicketResponseDto>> CreateTicket(CreateTicketDto request)
    {

        if (!User.TryGetCurrentUser(out var caller))
            return Unauthorized();

        var result = await _ticketService.CreateTicketAsync(request, caller.Id);

        return Ok(result);
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult<TicketResponseDto>> UpdateTicketStatus(int id, UpdateTicketStatusDto request, CancellationToken cancellationToken)
    {
        if (!User.TryGetCurrentUser(out var caller))
            return Unauthorized();

        var result = await _ticketService.UpdateTicketStatusAsync(id, request, caller, cancellationToken);

        if (result.Data is null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost("{id}/priority-suggestion")]
    public async Task<ActionResult<TicketAISuggestionDto>> SuggestPriority(int id, CancellationToken cancellationToken)
    {
        if (!User.TryGetCurrentUser(out var caller))
            return Unauthorized();

        var ticketResult = await _ticketService.GetTicketByIdAsync(id, caller, cancellationToken);

        if (ticketResult.Data is null)
            return NotFound();

        var result = await _ticketAIService.SuggestPriorityAsync(
            ticketResult.Data.Title,
            ticketResult.Data.Description,
            ticketResult.Data.Category);

        return Ok(result);
    }

    [HttpPost("{id}/response-suggestion")]
    public async Task<ActionResult<TicketAIResponseSuggestionDto>> SuggestResponse(int id, CancellationToken cancellationToken)
    {
        if (!User.TryGetCurrentUser(out var caller))
            return Unauthorized();

        var ticketResult = await _ticketService.GetTicketByIdAsync(id, caller, cancellationToken);

        if (ticketResult.Data is null)
            return NotFound();

        var result = await _ticketAIService.SuggestResponseAsync(
            ticketResult.Data.Title,
            ticketResult.Data.Description,
            ticketResult.Data.Category);

        return Ok(result);
    }

    [HttpPost("{id}/categorize")]
    public async Task<ActionResult<TicketCategorizationDto>> CategorizeTicket(int id, CancellationToken cancellationToken)
    {
        if (!User.TryGetCurrentUser(out var caller))
            return Unauthorized();

        var ticketResult = await _ticketService.GetTicketByIdAsync(id, caller, cancellationToken);

        if (ticketResult.Data is null)
            return NotFound();

        var result = await _ticketAIService.CategorizeAsync(
            ticketResult.Data.Title,
            ticketResult.Data.Description,
            ticketResult.Data.Category);

        return Ok(result);
    }

    [HttpGet("{id}/history")]
    public async Task<ActionResult<List<TicketHistoryResponseDto>>> GetHistoryByTicketIdAsync(int id, CancellationToken cancellationToken)
    {
        if (!User.TryGetCurrentUser(out var caller))
            return Unauthorized();

        var result = await _ticketService.GetHistoryByTicketIdAsync(id, caller, cancellationToken);

        return Ok(result);

    }

    [HttpPatch("{id}/assignment")]
    public async Task<ActionResult> AssignTicketAsync(int id, [FromBody] AssignTicketDto request, CancellationToken cancellationToken)
    {
        if (!User.TryGetCurrentUser(out var caller))
            return Unauthorized();

        var response = await _ticketService.AssignTicketAsync(id, request, caller, cancellationToken);

        return Ok(response);
    }
}
