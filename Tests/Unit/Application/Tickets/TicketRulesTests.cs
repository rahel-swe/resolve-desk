using ResolveDesk.Application.Common;
using ResolveDesk.Domain.Entities;
using ResolveDesk.Rules;

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

        var customer = new CurrentUser(Id: 10, Email: "customer@example.com", Role: "Customer");

        // Act 
        var result = rules.CanReadTicket(ticket, customer);

        // Assert
        Assert.True(result);
    }
}
