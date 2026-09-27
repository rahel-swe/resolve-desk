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
    public void CanReadTicket_WhenCustomerDoesNotOwnTicket_ReturnFalse()
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
    public void CanUpdateStatus_WhenUserIsCustomer_ReturnFalse()
    {
        var rules = new TicketRules();

        _ticket.UserId = 19;

        _currentUser = _currentUser with { Id = 19 };

        var result = rules.CanUpdateStatus(_ticket, _currentUser);

        Assert.False(result);
    }

    [Fact]
    public void CanUpdateStatus_WhenUserIsAdmin_ReturnTrue()
    {
        var rules = new TicketRules();

        _ticket.UserId = 19;

        _currentUser = _currentUser with { Id = 19, Role = UserRole.Admin };

        var result = rules.CanUpdateStatus(_ticket, _currentUser);

        Assert.True(result);
    }

    [Fact]
    public void CanUpdateStatus_WhenUserIsSupportAgentAndNotAssignedTicket_ReturnFalse()
    {
        var rules = new TicketRules();

        _ticket.AssignedAgentId = 19;

        _currentUser = _currentUser with { Id = 5, Role = UserRole.SupportAgent };

        var result = rules.CanUpdateStatus(_ticket, _currentUser);

        Assert.False(result);
    }

    [Fact]
    public void CanUpdateStatus_WhenUserIsSupportAgentAndAssignedTicket_ReturnTrue()
    {
        var rules = new TicketRules();

        _ticket.AssignedAgentId = 19;

        _currentUser = _currentUser with { Id = 19, Role = UserRole.SupportAgent };

        var result = rules.CanUpdateStatus(_ticket, _currentUser);

        Assert.True(result);
    }
}
