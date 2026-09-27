using ResolveDesk.Application.Common;
using ResolveDesk.Domain.Entities;
using ResolveDesk.Application.Tickets;
using ResolveDesk.Domain.Enums;

namespace ResolveDesk.Tests.Unit.Application.Tickets;

public class TicketRulesTests
{
    [Fact]
    public void CanReadTicket_WhenCustomerOwnsTicket_ReturnsTrue()
    {
        // Arrange
        var rules = new TicketRules();

        var ticket = new Ticket
        {
            UserId = 10
        };

        var customer = new CurrentUser(Id: 10, Email: "customer@example.com", Role: UserRole.Customer);

        // Act 
        var result = rules.CanReadTicket(ticket, customer);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void CanReadTicket_WhenCustomerDoesNotOwnTicket_ReturnFalse()
    {
        var rules = new TicketRules();

        var ticket = new Ticket
        {
            UserId = 10
        };

        var customer = new CurrentUser(Id: 7, Email: "customer@example.com", Role: UserRole.Customer);

        // Act
        var result = rules.CanReadTicket(ticket, customer);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void CanReadTicket_WhenAdminOrSupportAgentOwnsTicket_ReturnTrue()
    {
        var rules = new TicketRules();

        var ticket = new Ticket
        {
            UserId = 10
        };

        var admin = new CurrentUser(Id: 7, Email: "customer@example.com", Role: UserRole.Admin);

        var resultWithAdmin = rules.CanReadTicket(ticket, admin);
        Assert.True(resultWithAdmin);


    }
}
