using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ShopCatalog.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCatalog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Products_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "DisplayOrder", "Name" },
                values: new object[,]
                {
                    { 1, 1, "פירות וירקות" },
                    { 2, 2, "מוצרי חלב" },
                    { 3, 3, "בשר ודגים" },
                    { 4, 4, "מאפים" },
                    { 5, 5, "יבשים ושימורים" },
                    { 6, 6, "ניקיון" }
                });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "CategoryId", "Name", "Unit" },
                values: new object[,]
                {
                    { 1, 1, "עגבניות", "ק\"ג" },
                    { 2, 1, "מלפפונים", "ק\"ג" },
                    { 3, 1, "בננות", "ק\"ג" },
                    { 4, 1, "תפוחים", "ק\"ג" },
                    { 5, 1, "גזר", "ק\"ג" },
                    { 6, 1, "חסה", "יח'" },
                    { 7, 2, "חלב 3%", "יח'" },
                    { 8, 2, "קוטג' 5%", "יח'" },
                    { 9, 2, "גבינה צהובה", "יח'" },
                    { 10, 2, "יוגורט טבעי", "יח'" },
                    { 11, 2, "חמאה", "יח'" },
                    { 12, 2, "שמנת מתוקה", "יח'" },
                    { 13, 3, "חזה עוף", "ק\"ג" },
                    { 14, 3, "שניצל הודו", "ק\"ג" },
                    { 15, 3, "בשר טחון", "ק\"ג" },
                    { 16, 3, "פילה סלמון", "ק\"ג" },
                    { 17, 3, "נקניקיות", "יח'" },
                    { 18, 4, "לחם אחיד פרוס", "יח'" },
                    { 19, 4, "לחמניות", "יח'" },
                    { 20, 4, "פיתות", "יח'" },
                    { 21, 4, "חלה", "יח'" },
                    { 22, 4, "בורקס גבינה", "יח'" },
                    { 23, 5, "אורז", "יח'" },
                    { 24, 5, "פסטה", "יח'" },
                    { 25, 5, "קמח", "יח'" },
                    { 26, 5, "סוכר", "יח'" },
                    { 27, 5, "טונה בשמן", "יח'" },
                    { 28, 5, "תירס משומר", "יח'" },
                    { 29, 6, "נוזל כלים", "יח'" },
                    { 30, 6, "אבקת כביסה", "יח'" },
                    { 31, 6, "מגבות נייר", "יח'" },
                    { 32, 6, "שקיות זבל", "יח'" },
                    { 33, 6, "מטהר אוויר", "יח'" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Categories_DisplayOrder",
                table: "Categories",
                column: "DisplayOrder");

            migrationBuilder.CreateIndex(
                name: "IX_Products_CategoryId",
                table: "Products",
                column: "CategoryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "Categories");
        }
    }
}
