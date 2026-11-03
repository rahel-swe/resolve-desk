using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResolveDesk.Migrations
{
    /// <inheritdoc />
    public partial class StoreNumericUserRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                ALTER TABLE "Users"
                ALTER COLUMN "Role" TYPE integer
                USING CASE "Role"
                    WHEN 'Admin' THEN 0
                    WHEN 'SupportAgent' THEN 1
                    WHEN 'Staff' THEN 1
                    WHEN 'Customer' THEN 2
                    WHEN 'User' THEN 2
                END;
                """);

            migrationBuilder.AlterColumn<string>(
                name: "Bio",
                table: "Users",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // The former User role is merged into Customer and cannot be reconstructed.
            migrationBuilder.Sql("""
                ALTER TABLE "Users"
                ALTER COLUMN "Role" TYPE text
                USING CASE "Role"
                    WHEN 0 THEN 'Admin'
                    WHEN 1 THEN 'SupportAgent'
                    WHEN 2 THEN 'Customer'
                END;
                """);

            migrationBuilder.Sql("UPDATE \"Users\" SET \"Bio\" = '' WHERE \"Bio\" IS NULL;");

            migrationBuilder.AlterColumn<string>(
                name: "Bio",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }
    }
}
