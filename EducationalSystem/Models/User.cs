namespace EducationalSystem.Models;

public class User
{
    public long UserId { get; set; }
    public required string Name { get; set; }
    public required string Password { get; set; }
    public required string Email { get; set; }
    public UserStatus Status { get; set; }
}