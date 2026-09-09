using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupportPilotAI.Dtos;
using SupportPilotAI.Services;

namespace SupportPilotAI.Controllers;

[Authorize(Policy = "AdminOrUser")]
[ApiController]
[Route("api/tickets")]
public class TicketController(ITicketService ticketService) : ControllerBase
{
    private readonly ITicketService _ticketService = ticketService;

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

    [HttpPatch("{id:int}")]
    public async Task<ActionResult<TicketResponseDto>> UpdateTicketStatus(int id, UpdateTicketStatusDto request)
    {
        var result = await _ticketService.UpdateTicketStatusAsync(id, request);

        if (result is null)
            return NotFound();

        return Ok(result);
    }
}