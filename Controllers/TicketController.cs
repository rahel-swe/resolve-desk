using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
        var result = await _ticketService.GetAllTicketsAsync();

        return Ok(result.Data);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TicketResponseDto>> GetTicketById(int id)
    {
        var result = await _ticketService.GetTicketByIdAsync(id);

        if (result.Data is null)
            return NotFound();

        return Ok(result.Data);
    }

    [HttpPost]
    public async Task<ActionResult<TicketResponseDto>> CreateTicket(CreateTicketDto request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId is null) return Unauthorized();

        var result = await _ticketService.CreateTicketAsync(request, int.Parse(userId));

        return Ok(result.Data);
    }

    [HttpPatch("{id:int}")]
    public async Task<ActionResult<TicketResponseDto>> UpdateTicketStatus(int id, UpdateTicketStatusDto request)
    {
        var result = await _ticketService.UpdateTicketStatusAsync(id, request);

        if (result.Data is null)
            return NotFound();

        return Ok(result.Data);
    }

    [HttpPost("{id}/priority-suggestion")]
    public async Task<ActionResult<TicketAISuggestionDto>> SuggestPriority(int id)
    {
        var ticketResult = await _ticketService.GetTicketByIdAsync(id);

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
        var ticketResult = await _ticketService.GetTicketByIdAsync(id);

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
        var ticketResult = await _ticketService.GetTicketByIdAsync(id);

        if (ticketResult.Data is null)
            return NotFound();

        var result = await _ticketAIService.CategorizeAsync(
            ticketResult.Data.Title,
            ticketResult.Data.Description,
            ticketResult.Data.Category);

        return Ok(result);
    }
}
