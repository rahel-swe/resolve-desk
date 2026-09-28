using ResolveDesk.Application.Common;
using ResolveDesk.Domain.Entities;
using ResolveDesk.Application.Tickets;
using ResolveDesk.Domain.Enums;

namespace ResolveDesk.Tests.Unit.Application.Tickets;

public class TicketRulesTests
{
    private Ticket _ticket;
    private CurrentUser _currentUser;

    public TicketRulesTests()
    {
        _ticket = new Ticket
        {
            UserId = 10
        };

        _currentUser = new CurrentUser(Id: 10, Email: "customer@example.com", Role: UserRole.Customer);
    }

    [Fact]
    public void CanReadTicket_WhenCustomerOwnsTicket_ReturnsTrue()
    {
        // Arrange
        var rules = new TicketRules();

        // Act 
        var result = rules.CanReadTicket(_ticket, _currentUser);

        // Assert
        Assert.True(result);
    }

    [Fact]

    public void CanReadTicket_WhenCustomerDoesNotOwnTicket_ReturnsFalse()
    {
        var rules = new TicketRules();

        _currentUser = _currentUser with { Id = 7 };

        // Act
        var result = rules.CanReadTicket(_ticket, _currentUser);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void CanReadTicket_WhenUserIsAdmin_ReturnsTrue()
    {
        var rules = new TicketRules();

        _currentUser = _currentUser with { Id = 7, Role = UserRole.Admin };

        var resultWithAdmin = rules.CanReadTicket(_ticket, _currentUser);
        Assert.True(resultWithAdmin);


    }

    [Fact]
    public void CanUpdateStatus_WhenUserIsCustomer_ReturnsFalse()
    {
        var rules = new TicketRules();

        _ticket.UserId = 19;

        _currentUser = _currentUser with { Id = 19 };

        var result = rules.CanUpdateStatus(_ticket, _currentUser);

        Assert.False(result);
    }

    [Fact]
    public void CanUpdateStatus_WhenUserIsAdmin_ReturnsTrue()
    {
        var rules = new TicketRules();

        _ticket.UserId = 19;

        _currentUser = _currentUser with { Id = 19, Role = UserRole.Admin };

        var result = rules.CanUpdateStatus(_ticket, _currentUser);

        Assert.True(result);
    }

    [Fact]
    public void CanUpdateStatus_WhenUserIsSupportAgentAndNotAssignedTicket_ReturnsFalse()
    {
        var rules = new TicketRules();

        _ticket.AssignedAgentId = 19;

        _currentUser = _currentUser with { Id = 5, Role = UserRole.SupportAgent };

        var result = rules.CanUpdateStatus(_ticket, _currentUser);

        Assert.False(result);
    }

    [Fact]
    public void CanUpdateStatus_WhenUserIsSupportAgentAndAssignedTicket_ReturnsTrue()
    {
        var rules = new TicketRules();

        _ticket.AssignedAgentId = 19;

        _currentUser = _currentUser with { Id = 19, Role = UserRole.SupportAgent };

        var result = rules.CanUpdateStatus(_ticket, _currentUser);

        Assert.True(result);
    }

    [Theory]
    [InlineData(TicketStatus.Open, TicketStatus.InProgress, true)]
    [InlineData(TicketStatus.Open, TicketStatus.Resolved, false)]
    [InlineData(TicketStatus.InProgress, TicketStatus.WaitingForCustomer, true)]
    [InlineData(TicketStatus.InProgress, TicketStatus.Resolved, true)]
    [InlineData(TicketStatus.Resolved, TicketStatus.Closed, true)]
    [InlineData(TicketStatus.Closed, TicketStatus.InProgress, false)]
    public void IsValidStatusTransition_ReturnsExpectedResult(TicketStatus current, TicketStatus next, bool expected)
    {
        var rules = new TicketRules();

        var result = rules.IsValidStatusTransition(current, next);

        Assert.Equal(expected, result);
    }

    [Fact]
    public void CanAssignTicket_WhenUserIsAdmin_ReturnsTrue()
    {
        var rules = new TicketRules();

        _ticket.AssignedAgentId = 23;

        _currentUser = _currentUser with { Id = 1, Role = UserRole.Admin, Email = "admin@example.com" };

        var result = rules.CanAssignTicket(_ticket, _currentUser, agentId: 3);

        Assert.True(result);
    }

    [Fact]
    public void CanAssignTicket_WhenSupportAgentClaimsUnassignedTicketForSelf_ReturnsTrue()
    {
        var rules = new TicketRules();

        _ticket.AssignedAgent = null;

        _currentUser = _currentUser with { Role = UserRole.SupportAgent, Id = 17, Email = "agent@example.com" };

        var result = rules.CanAssignTicket(_ticket, _currentUser, 17);

        Assert.True(result);
    }

    [Fact]
    public void CanAssignTicket_WhenSupportAgentAssignsTicketToAnotherAgent_ReturnsFalse()
    {
        var rules = new TicketRules();

        _ticket.AssignedAgentId = null;

        _currentUser = _currentUser with { Id = 20, Email = "agent@example.com", Role = UserRole.SupportAgent };

        var result = rules.CanAssignTicket(_ticket, _currentUser, 21);

        Assert.False(result);
    }
}
