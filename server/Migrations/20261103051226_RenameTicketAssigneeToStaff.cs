using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResolveDesk.Migrations
{
    /// <inheritdoc />
    public partial class RenameTicketAssigneeToStaff : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "AssignedAgentId",
                table: "Tickets",
                newName: "AssignedStaffId");

            migrationBuilder.RenameIndex(
                name: "IX_Tickets_AssignedAgentId",
                table: "Tickets",
                newName: "IX_Tickets_AssignedStaffId");

            migrationBuilder.Sql("""
                ALTER TABLE "Tickets"
                RENAME CONSTRAINT "FK_Tickets_Users_AssignedAgentId"
                TO "FK_Tickets_Users_AssignedStaffId";
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                ALTER TABLE "Tickets"
                RENAME CONSTRAINT "FK_Tickets_Users_AssignedStaffId"
                TO "FK_Tickets_Users_AssignedAgentId";
                """);

            migrationBuilder.RenameIndex(
                name: "IX_Tickets_AssignedStaffId",
                table: "Tickets",
                newName: "IX_Tickets_AssignedAgentId");

            migrationBuilder.RenameColumn(
                name: "AssignedStaffId",
                table: "Tickets",
                newName: "AssignedAgentId");
        }
    }
}
