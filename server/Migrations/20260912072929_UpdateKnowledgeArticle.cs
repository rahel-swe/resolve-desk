using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResolveDesk.Migrations
{
    /// <inheritdoc />
    public partial class UpdateKnowledgeArticle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "KnowledgeArticles",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "KnowledgeArticles",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<List<string>>(
                name: "Tags",
                table: "KnowledgeArticles",
                type: "text[]",
                nullable: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "KnowledgeArticles",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "KnowledgeArticles",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_KnowledgeArticles_UserId",
                table: "KnowledgeArticles",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_KnowledgeArticles_Users_UserId",
                table: "KnowledgeArticles",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_KnowledgeArticles_Users_UserId",
                table: "KnowledgeArticles");

            migrationBuilder.DropIndex(
                name: "IX_KnowledgeArticles_UserId",
                table: "KnowledgeArticles");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "KnowledgeArticles");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "KnowledgeArticles");

            migrationBuilder.DropColumn(
                name: "Tags",
                table: "KnowledgeArticles");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "KnowledgeArticles");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "KnowledgeArticles");
        }
    }
}
