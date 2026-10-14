using Microsoft.EntityFrameworkCore;
using ResolveDesk.Domain.Entities;
using ResolveDesk.Domain.Enums;

namespace ResolveDesk.Infrastructure.Data;

/// <summary>Explicit, additive sample data. Never invoked by normal application startup.</summary>
public static class DevelopmentSeed
{
    private const string Prefix = "[ResolveDesk seed v1]";
    private static readonly (string Name, string Email, UserRole Role)[] Accounts =
    [
        ("Seed Admin", "seed.admin@example.test", UserRole.Admin),
        ("Seed Agent", "seed.agent@example.test", UserRole.SupportAgent),
        ("Second Seed Agent", "seed.agent-other@example.test", UserRole.SupportAgent),
        ("Seed Customer", "seed.customer@example.test", UserRole.Customer),
        ("Second Seed Customer", "seed.customer-other@example.test", UserRole.Customer),
        ("Seed User", "seed.user@example.test", UserRole.User)
    ];

    public static async Task RunAsync(AppDbContext db, IConfiguration configuration, ILogger logger,
        CancellationToken cancellationToken = default)
    {
        var password = configuration["DevelopmentSeed:Password"];

        if (string.IsNullOrWhiteSpace(password) || password.Length < 8 || System.Text.Encoding.UTF8.GetByteCount(password) > 72)
            throw new InvalidOperationException("Set DevelopmentSeed__Password to a private 8–72 byte password before seeding.");

        // Migrations are a separate operation: never silently change the database schema.
        if ((await db.Database.GetPendingMigrationsAsync(cancellationToken)).Any())
            throw new InvalidOperationException("Apply pending migrations before running the development seed.");

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);

        // Serialize concurrent runs; all writes are committed together or rolled back together.
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(682409311)", cancellationToken);

        // Existing manually imported IDs can leave identity sequences behind the rows.
        // Hold write locks while moving them forward; never lower a live sequence.

        await db.Database.ExecuteSqlRawAsync(
            "LOCK TABLE \"Users\", \"Tickets\", \"TicketComments\", \"TicketHistories\", \"KnowledgeArticles\" IN SHARE ROW EXCLUSIVE MODE", cancellationToken);

        await db.Database.ExecuteSqlRawAsync("""
            SELECT setval(pg_get_serial_sequence('"Users"', 'Id'), GREATEST(COALESCE((SELECT MAX("Id") FROM "Users"), 0) + 1, nextval(pg_get_serial_sequence('"Users"', 'Id'))), false);
            SELECT setval(pg_get_serial_sequence('"Tickets"', 'Id'), GREATEST(COALESCE((SELECT MAX("Id") FROM "Tickets"), 0) + 1, nextval(pg_get_serial_sequence('"Tickets"', 'Id'))), false);
            SELECT setval(pg_get_serial_sequence('"TicketComments"', 'Id'), GREATEST(COALESCE((SELECT MAX("Id") FROM "TicketComments"), 0) + 1, nextval(pg_get_serial_sequence('"TicketComments"', 'Id'))), false);
            SELECT setval(pg_get_serial_sequence('"TicketHistories"', 'Id'), GREATEST(COALESCE((SELECT MAX("Id") FROM "TicketHistories"), 0) + 1, nextval(pg_get_serial_sequence('"TicketHistories"', 'Id'))), false);
            SELECT setval(pg_get_serial_sequence('"KnowledgeArticles"', 'Id'), GREATEST(COALESCE((SELECT MAX("Id") FROM "KnowledgeArticles"), 0) + 1, nextval(pg_get_serial_sequence('"KnowledgeArticles"', 'Id'))), false);
            """, cancellationToken);

        var users = new Dictionary<string, User>(StringComparer.Ordinal);
        var createdUsers = 0;

        foreach (var account in Accounts)
        {
            var existing = await db.Users.Where(user => user.Email.ToLower() == account.Email).ToListAsync(cancellationToken);
            if (existing.Count > 1)
                throw new InvalidOperationException($"Duplicate seed email found: {account.Email}. No changes committed.");
            var user = existing.SingleOrDefault();
            if (user is not null)
            {
                if (user.FullName != account.Name || user.Role != account.Role || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
                    throw new InvalidOperationException($"Seed account collision: {account.Email}. Existing accounts are never promoted or reset.");
            }
            else
            {
                user = new User
                {
                    FullName = account.Name,
                    Email = account.Email,
                    Role = account.Role,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12)
                };
                db.Users.Add(user);
                createdUsers++;
            }
            users.Add(account.Email, user);
        }
        await db.SaveChangesAsync(cancellationToken);

        var seedUserIds = users.Values.Select(user => user.Id).ToArray();
        var existingTitles = await db.Tickets
            .Where(ticket => ticket.Title.StartsWith(Prefix) && seedUserIds.Contains(ticket.UserId))
            .Select(ticket => ticket.Title).ToListAsync(cancellationToken);
        var titles = existingTitles.ToHashSet(StringComparer.Ordinal);
        var createdTickets = 0;
        var anchor = new DateTime(2026, 10, 1, 12, 0, 0, DateTimeKind.Utc);
        for (var index = 1; index <= 72; index++)
        {
            var title = $"{Prefix} Request {index:D3}: {(index % 2 == 0 ? "Login assistance" : "Invoice question")}";
            if (titles.Contains(title)) continue;
            var requester = index <= 40 ? users["seed.customer@example.test"]
                : index <= 64 ? users["seed.customer-other@example.test"] : users["seed.user@example.test"];
            var status = (TicketStatus)((index - 1) % 5);
            var createdAt = anchor.AddMinutes(index);
            var ticket = new Ticket
            {
                Title = title,
                Description = $"Isolated development sample request {index:D3}. Please help investigate this {(index % 2 == 0 ? "login" : "invoice")} issue.",
                Category = index % 2 == 0 ? "IT Support" : "Finance",
                Priority = (TicketPriority)((index - 1) % 4),
                Status = status,
                User = requester,
                CreatedAt = createdAt,
                UpdatedAt = createdAt,
                AssignedAgent = index % 3 == 0 ? null : users[index % 3 == 1 ? "seed.agent@example.test" : "seed.agent-other@example.test"]
            };
            ticket.Comments.Add(new TicketComment
            {
                Message = $"{Prefix} Sample conversation for request {index:D3}.",
                User = requester,
                CreatedAt = createdAt.AddSeconds(1)
            });
            db.Tickets.Add(ticket);
            // Represent valid transitions rather than inventing a single invalid jump.
            var path = status switch
            {
                TicketStatus.InProgress => new[] { TicketStatus.Open, TicketStatus.InProgress },
                TicketStatus.WaitingForCustomer => [TicketStatus.Open, TicketStatus.InProgress, TicketStatus.WaitingForCustomer],
                TicketStatus.Resolved => [TicketStatus.Open, TicketStatus.InProgress, TicketStatus.Resolved],
                TicketStatus.Closed => [TicketStatus.Open, TicketStatus.InProgress, TicketStatus.Resolved, TicketStatus.Closed],
                _ => [TicketStatus.Open]
            };
            for (var step = 1; step < path.Length; step++)
                db.TicketHistories.Add(new TicketHistory
                {
                    Ticket = ticket,
                    ActorUser = users["seed.admin@example.test"],
                    OldStatus = path[step - 1],
                    NewStatus = path[step],
                    CreatedAt = createdAt.AddSeconds(step + 1)
                });
            createdTickets++;
        }

        var articleTitle = $"{Prefix} Login troubleshooting";
        var seededArticle = await db.KnowledgeArticles.Include(article => article.User)
            .SingleOrDefaultAsync(article => article.Title == articleTitle, cancellationToken);
        if (seededArticle is null)
            db.KnowledgeArticles.Add(new KnowledgeArticle
            {
                Title = articleTitle,
                Content = "Confirm the account is active, retry with the correct credentials, and contact support if the problem continues.",
                Category = "IT Support",
                Tags = ["seed", "login", "development"],
                User = users["seed.admin@example.test"],
                CreatedByUserId = users["seed.admin@example.test"].Id,
                CreatedAt = anchor,
                UpdatedAt = anchor
            });

        if (seededArticle is not null)
        {
            if (seededArticle.User.Id != users["seed.admin@example.test"].Id)
                throw new InvalidOperationException("Seed article title collision. Existing content is never replaced.");
            if (seededArticle.CreatedByUserId == 0)
                seededArticle.CreatedByUserId = seededArticle.User.Id;
        }

        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        logger.LogInformation("Development seed committed: {Users} new accounts, {Tickets} new tickets. Existing account passwords and ticket changes were preserved.", createdUsers, createdTickets);
    }
}
