using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResolveDesk.Common;
using ResolveDesk.Dtos;
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
    public async Task<ActionResult<List<TicketResponseDto>>> GetAllTickets()

    {
        if (!User.TryGetCurrentUser(out var caller))
            return Unauthorized();

        var result = await _ticketService.GetAllTicketsAsync(caller);

        return Ok(result.Data);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TicketResponseDto>> GetTicketById(int id)
    {

        if (!User.TryGetCurrentUser(out var caller))
            return Unauthorized();

        var result = await _ticketService.GetTicketByIdAsync(id, caller);

        if (result.Data is null)
            return NotFound();

        return Ok(result.Data);
    }

    [HttpPost]
    public async Task<ActionResult<TicketResponseDto>> CreateTicket(CreateTicketDto request)
    {

        if (!User.TryGetCurrentUser(out var caller))
            return Unauthorized();

        var result = await _ticketService.CreateTicketAsync(request, caller.Id);

        return Ok(result.Data);
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult<TicketResponseDto>> UpdateTicketStatus(int id, UpdateTicketStatusDto request)
    {
        if (!User.TryGetCurrentUser(out var caller))
            return Unauthorized();

        var result = await _ticketService.UpdateTicketStatusAsync(id, request, caller);

        if (result.Data is null)
            return NotFound();

        return Ok(result.Data);
    }

    [HttpPost("{id}/priority-suggestion")]
    public async Task<ActionResult<TicketAISuggestionDto>> SuggestPriority(int id)
    {
        if (!User.TryGetCurrentUser(out var caller))
            return Unauthorized();

        var ticketResult = await _ticketService.GetTicketByIdAsync(id, caller);

        if (ticketResult.Data is null)
            return NotFound();

        var result = await _ticketAIService.SuggestPriorityAsync(
            ticketResult.Data.Title,
            ticketResult.Data.Description,
            ticketResult.Data.Category);

        return Ok(result);
    }

    [HttpPost("{id}/response-suggestion")]
    public async Task<ActionResult<TicketAIResponseSuggestionDto>> SuggestResponse(int id)
    {
        if (!User.TryGetCurrentUser(out var caller))
            return Unauthorized();

        var ticketResult = await _ticketService.GetTicketByIdAsync(id, caller);

        if (ticketResult.Data is null)
            return NotFound();

        var result = await _ticketAIService.SuggestResponseAsync(
            ticketResult.Data.Title,
            ticketResult.Data.Description,
            ticketResult.Data.Category);

        return Ok(result);
    }

    [HttpPost("{id}/categorize")]
    public async Task<ActionResult<TicketCategorizationDto>> CategorizeTicket(int id)
    {
        if (!User.TryGetCurrentUser(out var caller))
            return Unauthorized();

        var ticketResult = await _ticketService.GetTicketByIdAsync(id, caller);

        if (ticketResult.Data is null)
            return NotFound();

        var result = await _ticketAIService.CategorizeAsync(
            ticketResult.Data.Title,
            ticketResult.Data.Description,
            ticketResult.Data.Category);

        return Ok(result);
    }
}
