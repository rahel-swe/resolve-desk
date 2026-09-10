using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupportPilotAI.Dtos;
using SupportPilotAI.Services;

namespace SupportPilotAI.Controllers;

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
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TicketResponseDto>> GetTicketById(int id)
    {
        var result = await _ticketService.GetTicketByIdAsync(id);

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<TicketResponseDto>> CreateTicket(CreateTicketDto request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId is null) return Unauthorized();

        var result = await _ticketService.CreateTicketAsync(request, int.Parse(userId));

        return Ok(result);
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult<TicketResponseDto>> UpdateTicketStatus(int id, UpdateTicketStatusDto request)
    {
        var result = await _ticketService.UpdateTicketStatusAsync(id, request);

        return Ok(result);
    }

    [HttpPost("{id}/priority-suggestion")]
    public async Task<ActionResult<TicketAISuggestionDto>> SuggestPriority(int id)
    {
        var respone = await _ticketService.GetTicketByIdAsync(id);

        var ticket = respone.Data;

        if (ticket is null) return NotFound();

        var result = await _ticketAIService.SuggestResponseAsync(
            ticket.Title, ticket.Description, ticket.Category);

        return Ok(result);
    }

    public async Task<ActionResult<TicketCategorizationDto>> CategorizeTicket(int id)
    {
        var ticketResult = await _ticketService.GetTicketByIdAsync(id);

        var ticket = ticketResult.Data;

        if (ticket is null)
            return NotFound();

        var result = await _ticketAIService.CategorizeAsync(ticket.Title, ticket.Description, ticket.Category);

        return Ok(result);
    }
}